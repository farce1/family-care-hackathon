import io
import logging
import os
from datetime import datetime

import PyPDF2
from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from openai import OpenAI
from pydantic import BaseModel

try:
    import pytesseract
    from pdf2image import convert_from_bytes

    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

# Load environment variables
load_dotenv()

# Validate and initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")
client = OpenAI(api_key=OPENAI_API_KEY)


class AppointmentData(BaseModel):
    name: str = "Medical Report"
    date: str
    appointment_type: str
    summary: str = ""
    file_size: int
    doctor: str = ""
    confidence_score: int = 0




# Create router
router = APIRouter()

# Maximum file size: 15MB
MAX_FILE_SIZE = 15 * 1024 * 1024


@router.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    """
    Parse PDF file to extract appointment information using ChatGPT API.

    Parameters:
        file: PDF file to parse

    Returns:
        name: Title/name of the appointment or medical report
        date: Date of the appointment in YYYY-MM-DD format
        appointment_type: One of the predefined appointment types
        summary: Summary of appointment or medical recommendations
        file_size: Size of the uploaded file in bytes
        doctor: Name of doctor or facility name if doctor not available
        confidence_score: AI confidence score (0-100)
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
        # Read PDF content
        pdf_content = await file.read()

        # Validate file size
        if len(pdf_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024):.0f}MB",
            )

        if len(pdf_content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")

        # Function to extract text with rotation attempts and OCR fallback
        def extract_text_with_rotation(pdf_bytes):
            logging.info("Starting text extraction with rotation attempts")
            rotations = [0, 90, 180, 270]  # Try each rotation

            for rotation in rotations:
                logging.info(f"Attempting rotation: {rotation} degrees")
                try:
                    # Reset file pointer
                    pdf_bytes.seek(0)
                    reader = PyPDF2.PdfReader(pdf_bytes)

                    # If rotation needed, create rotated PDF
                    if rotation > 0:
                        logging.info(f"Applying rotation {rotation} to PDF")
                        writer = PyPDF2.PdfWriter()
                        for page in reader.pages:
                            page.rotate(rotation)
                            writer.add_page(page)

                        # Write rotated PDF to new BytesIO
                        rotated_pdf = io.BytesIO()
                        writer.write(rotated_pdf)
                        rotated_pdf.seek(0)
                        reader = PyPDF2.PdfReader(rotated_pdf)

                    # Extract text
                    text_content = ""
                    for page in reader.pages:
                        page_text = page.extract_text()
                        text_content += page_text + "\n"

                    # Check if we got meaningful text (more than just whitespace)
                    stripped_content = text_content.strip()
                    if stripped_content and len(stripped_content) > 10:
                        logging.info(
                            f"Successfully extracted text with rotation {rotation}, length: {len(stripped_content)}"
                        )
                        return text_content

                    # Try OCR if available and regular extraction failed
                    if OCR_AVAILABLE:
                        logging.info(
                            f"Regular extraction failed for rotation {rotation}, attempting OCR"
                        )
                        try:
                            # Reset file pointer for OCR
                            pdf_bytes.seek(0)
                            pdf_data = pdf_bytes.read()

                            # Convert PDF to images for OCR
                            images = convert_from_bytes(pdf_data, dpi=300)
                            logging.info(f"Converted PDF to {len(images)} images for OCR")

                            ocr_text = ""
                            for i, image in enumerate(images):
                                # Apply rotation to image if needed
                                if rotation > 0:
                                    image = image.rotate(
                                        -rotation, expand=True
                                    )  # PIL uses counterclockwise rotation
                                    logging.info(
                                        f"Applied inverse rotation {rotation} to image {i}"
                                    )

                                # Perform OCR on the image
                                page_text = pytesseract.image_to_string(
                                    image, lang="pol+eng"
                                )  # Support Polish and English
                                ocr_text += page_text + "\n"

                            # Check if OCR extracted meaningful text
                            stripped_ocr = ocr_text.strip()
                            if (
                                stripped_ocr and len(stripped_ocr) > 20
                            ):  # OCR might extract some garbage, so higher threshold
                                logging.info(
                                    f"OCR successful for rotation {rotation}, extracted text length: {len(stripped_ocr)}"
                                )
                                return ocr_text
                            else:
                                logging.warning(
                                    f"OCR for rotation {rotation} extracted insufficient text (length: {len(stripped_ocr)})"
                                )

                        except Exception as ocr_error:
                            logging.warning(f"OCR failed for rotation {rotation}: {ocr_error!s}")
                            # OCR failed, continue to next rotation
                            continue

                except Exception as e:
                    logging.warning(f"Rotation {rotation} failed: {e!s}")
                    # If this rotation fails, continue to next rotation
                    continue

            # If all rotations and OCR attempts failed, return empty string
            logging.warning("All rotation attempts and OCR failed, returning empty string")
            return ""

        # Extract text from PDF with rotation attempts
        logging.info(f"Starting PDF processing for file: {file.filename}")
        text_content = extract_text_with_rotation(io.BytesIO(pdf_content))

        if not text_content.strip():
            logging.error(f"Failed to extract any text from PDF: {file.filename}")
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF even after trying different rotations",
            )

        logging.info(f"Successfully extracted text from PDF, length: {len(text_content.strip())}")

        # Use ChatGPT to parse the appointment data
        logging.info("Preparing ChatGPT prompt for appointment data extraction")
        prompt = f"""
        Extract appointment information from the following medical document text.
        Return all text in english only.
        Return ONLY a JSON object with exactly these fields:
        - name: Title or name of the appointment/medical report (e.g., "Dermatology Consultation", "Blood Test Results")
        - date: The appointment date in YYYY-MM-DD format (extract from the document)
        - appointment_type: Must be one of these exact values: 'General Checkup', 'Dental', 'Vision', 'Specialist', 'Vaccination', 'Follow-up', 'Emergency', 'Lab Work', 'Physical Therapy', 'Mental Health', 'Veterinary'
        - summary:
            Provide a comprehensive expert medical analysis including: patient demographics and history, chief complaint and symptoms, detailed physical examination findings with clinical significance, complete diagnostic test results with normal ranges and interpretation, definitive or differential diagnosis with clinical reasoning, treatment plan with medications (doses, frequencies, duration), preventive measures, lifestyle recommendations, follow-up schedule and monitoring parameters, potential complications or red flags, prognosis and expected outcomes, and any other critical clinical insights or recommendations based on medical expertise.

            + Summarize physical exam findings and what they mean in simple terms (e.g., "Your lungs sounded clear, which means there are no signs of infection.")
            + Avoid numeric lab values — instead, explain results conceptually ("Your blood sugar was higher than normal, which can mean…").
            + Describe what treatments are recommended and why.
            + For medications: name, what it does, how often to take it, how long, and common side effects in simple terms.
            + Include lifestyle advice (diet, exercise, sleep, stress, smoking, alcohol) in positive, encouraging language.
            + Mention any procedures or therapies and explain what to expect.
        - doctor: Name of the doctor, or name of the medical facility/clinic if doctor name not available
        - confidence_score: A score between 0 and 100 indicating how certain you are about the information you extracted from the document

        Document text:
        {text_content[:15000]}  # Limit text to avoid token limits
        """

        logging.info("Making ChatGPT API call for appointment parsing")
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical document parser. Always return valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.1,  # Low temperature for consistent parsing
                max_tokens=4096,
            )
            logging.info("ChatGPT API call successful")
        except Exception as e:
            logging.error(f"ChatGPT API call failed: {e!s}")
            raise HTTPException(
                status_code=500, detail="Failed to process document with AI service"
            )

        # Parse the response
        result_text = response.choices[0].message.content.strip()
        logging.info(f"Raw ChatGPT response: {result_text[:500]}...")

        # Try to extract JSON from the response
        import json

        logging.info("Parsing JSON response from ChatGPT")
        try:
            # Remove any markdown formatting if present
            if result_text.startswith("```json"):
                logging.info("Removing markdown formatting from JSON response")
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            parsed_data = json.loads(result_text.strip())
            logging.info("Successfully parsed JSON response")

            # Add file size to the response
            parsed_data["file_size"] = len(pdf_content)
            logging.info(f"Added file size: {len(pdf_content)} bytes")

            # Get confidence score
            confidence_score = parsed_data.get("confidence_score", 0)
            logging.info(f"Extracted confidence score: {confidence_score}")

            # Check if confidence score is below 51 - return error
            if confidence_score < 51:
                logging.warning(
                    f"Low confidence score: {confidence_score}, rejecting appointment data"
                )
                raise HTTPException(
                    status_code=400,
                    detail=f"Low confidence score ({confidence_score}). Unable to reliably extract appointment information.",
                )

            # Check if any required fields are missing/empty
            required_fields = ["name", "date", "summary", "doctor"]
            missing_fields = [
                field for field in required_fields if not parsed_data.get(field, "").strip()
            ]

            if missing_fields:
                logging.warning(
                    f"Missing required fields: {missing_fields}, confidence: {confidence_score}"
                )
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required fields: {', '.join(missing_fields)}. Confidence score: {confidence_score}",
                )

            logging.info("All required fields present and confidence score acceptable")

            # Handle appointment_type logic
            valid_types = [
                "General Checkup",
                "Dental",
                "Vision",
                "Specialist",
                "Vaccination",
                "Follow-up",
                "Emergency",
                "Lab Work",
                "Physical Therapy",
                "Mental Health",
                "Veterinary",
                "Other",
            ]

            appointment_type = parsed_data.get("appointment_type", "").strip()
            logging.info(f"Original appointment type: '{appointment_type}'")

            # If appointment_type is missing or invalid, and confidence is high enough, set to "Other"
            if (
                not appointment_type or appointment_type not in valid_types[:-1]
            ):  # Exclude "Other" from invalid check
                if confidence_score > 51:
                    parsed_data["appointment_type"] = "Other"
                    logging.info("Set appointment type to 'Other' due to high confidence score")
                else:
                    logging.warning(
                        f"Cannot determine appointment type and confidence ({confidence_score}) too low to use 'Other'"
                    )
                    raise HTTPException(
                        status_code=409,
                        detail=f"Cannot determine appointment type and confidence score ({confidence_score}) is not high enough to use 'Other'",
                    )
            elif appointment_type not in valid_types:
                # This shouldn't happen with the above logic, but just in case
                logging.warning(f"Invalid appointment type after validation: {appointment_type}")
                raise HTTPException(
                    status_code=409, detail=f"Invalid appointment type: {appointment_type}"
                )

            logging.info(f"Final appointment type: {parsed_data['appointment_type']}")

            # Validate date format with proper parsing
            date_str = parsed_data.get("date", "").strip()
            logging.info(f"Original date: '{date_str}'")
            if not date_str:
                parsed_data["date"] = datetime.now().strftime("%Y-%m-%d")
                logging.warning(f"Empty date, using current date: {parsed_data['date']}")
            else:
                try:
                    # Try to parse the date to validate it's a real date
                    datetime.strptime(date_str, "%Y-%m-%d")
                    logging.info(f"Valid date format: {date_str}")
                except ValueError:
                    # If parsing fails, use current date
                    parsed_data["date"] = datetime.now().strftime("%Y-%m-%d")
                    logging.warning(
                        f"Invalid date '{date_str}', using current date: {parsed_data['date']}"
                    )

            appointment_data = AppointmentData(**parsed_data)
            logging.info("Successfully created AppointmentData object")

        except (json.JSONDecodeError, ValueError) as e:
            # Fallback if JSON parsing fails - this represents low confidence
            logging.error(f"Failed to parse JSON response: {e!s}")
            logging.error(f"Raw response that failed parsing: {result_text[:1000]}")
            raise HTTPException(
                status_code=400,
                detail="Failed to parse JSON response from AI service. Unable to extract appointment information.",
            )

        # Return parsed appointment data
        logging.info("Appointment processing completed successfully")
        response_data = appointment_data.model_dump()
        response_data["original_filename"] = file.filename
        return JSONResponse(content=response_data)

    except HTTPException:
        # Re-raise HTTPExceptions as they already have the correct status code
        logging.warning("HTTPException raised during appointment processing")
        raise
    except Exception as e:
        logging.error(f"Unexpected error during PDF processing: {e!s}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {e!s}")
