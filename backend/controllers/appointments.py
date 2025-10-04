from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
import PyPDF2
from openai import OpenAI
import io
from typing import Optional, List
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import logging
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_bytes
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("API_KEY"))

# Database setup
DATABASE_URL = "postgresql://familycare:familycare@postgres:5432/familycare"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models and auth dependencies
from models import ParsedAppointment, User

# Import auth dependencies
from controllers.auth import get_current_user

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AppointmentData(BaseModel):
    name: str = "Medical Report"
    date: str
    appointment_type: str
    summary: str = ""
    file_size: int
    doctor: str = ""
    confidence_score: int = 0

class ParsedAppointmentResponse(BaseModel):
    id: str
    original_filename: str
    name: str
    date: str
    appointment_type: str
    summary: Optional[str]
    doctor: Optional[str]
    file_size: int
    processing_status: str
    confidence_score: int
    created_at: str
    updated_at: str

# Create router
router = APIRouter()

@router.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Parse PDF file to extract appointment information using ChatGPT API.
    Stores the parsed data in the database.

    Parameters:
        file: PDF file to parse

    Returns:
        name: Title/name of the appointment or medical report
        date: Date of the appointment in YYYY-MM-DD format
        appointment_type: One of the predefined appointment types
        summary: Summary of appointment or medical recommendations
        file_size: Size of the uploaded file in bytes
        doctor: Name of doctor or facility name if doctor not available
        id: Database ID of the stored record
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
        # Read PDF content
        pdf_content = await file.read()
        pdf_file = io.BytesIO(pdf_content)

        # Function to extract text with rotation attempts and OCR fallback
        def extract_text_with_rotation(pdf_bytes):
            logging.info("Starting text extraction with rotation attempts")
            rotations = [0, 90, 180, 270, 360]  # Try each rotation up to 360 degrees

            for rotation in rotations:
                logging.info(f"Attempting rotation: {rotation} degrees")
                try:
                    # Reset file pointer
                    pdf_bytes.seek(0)
                    reader = PyPDF2.PdfReader(pdf_bytes)

                    # If rotation needed, create rotated PDF
                    if rotation > 0:
                        logging.debug(f"Applying rotation {rotation} to PDF")
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
                        logging.info(f"Successfully extracted text with rotation {rotation}, length: {len(stripped_content)}")
                        return text_content

                    # Try OCR if available and regular extraction failed
                    if OCR_AVAILABLE:
                        logging.info(f"Regular extraction failed for rotation {rotation}, attempting OCR")
                        try:
                            # Reset file pointer for OCR
                            pdf_bytes.seek(0)
                            pdf_data = pdf_bytes.read()

                            # Convert PDF to images for OCR
                            images = convert_from_bytes(pdf_data, dpi=300)
                            logging.debug(f"Converted PDF to {len(images)} images for OCR")

                            ocr_text = ""
                            for i, image in enumerate(images):
                                # Apply rotation to image if needed
                                if rotation > 0:
                                    image = image.rotate(-rotation, expand=True)  # PIL uses counterclockwise rotation
                                    logging.debug(f"Applied inverse rotation {rotation} to image {i}")

                                # Perform OCR on the image
                                page_text = pytesseract.image_to_string(image, lang='pol+eng')  # Support Polish and English
                                ocr_text += page_text + "\n"

                            # Check if OCR extracted meaningful text
                            stripped_ocr = ocr_text.strip()
                            if stripped_ocr and len(stripped_ocr) > 20:  # OCR might extract some garbage, so higher threshold
                                logging.info(f"OCR successful for rotation {rotation}, extracted text length: {len(stripped_ocr)}")
                                return ocr_text
                            else:
                                logging.warning(f"OCR for rotation {rotation} extracted insufficient text (length: {len(stripped_ocr)})")

                        except Exception as ocr_error:
                            logging.error(f"OCR failed for rotation {rotation}: {str(ocr_error)}")
                            # OCR failed, continue to next rotation
                            continue

                except Exception as e:
                    logging.error(f"Rotation {rotation} failed: {str(e)}")
                    # If this rotation fails, continue to next rotation
                    continue

            # If all rotations and OCR attempts failed, return empty string
            logging.error("All rotation attempts and OCR failed, returning empty string")
            return ""

        # Extract text from PDF with rotation attempts
        text_content = extract_text_with_rotation(io.BytesIO(pdf_content))

        if not text_content.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF even after trying different rotations")

        # Use ChatGPT to parse the appointment data
        prompt = f"""
        Extract appointment information from the following medical document text.
        Return all text in english only.
        Return ONLY a JSON object with exactly these fields:
        - name: Title or name of the appointment/medical report (e.g., "Dermatology Consultation", "Blood Test Results")
        - date: The appointment date in YYYY-MM-DD format (extract from the document)
        - appointment_type: Must be one of these exact values: 'General Checkup', 'Dental', 'Vision', 'Specialist', 'Vaccination', 'Follow-up', 'Emergency', 'Lab Work', 'Physical Therapy', 'Mental Health', 'Veterinary'
        - summary:
            Provide a comprehensive expert medical analysis including: patient demographics and history, chief complaint and symptoms, detailed physical examination findings with clinical significance, complete diagnostic test results with normal ranges and interpretation, definitive or differential diagnosis with clinical reasoning, treatment plan with medications (doses, frequencies, duration), preventive measures, lifestyle recommendations, follow-up schedule and monitoring parameters, potential complications or red flags, prognosis and expected outcomes, and any other critical clinical insights or recommendations based on medical expertise.

            + Summarize physical exam findings and what they mean in simple terms (e.g., “Your lungs sounded clear, which means there are no signs of infection.”)
            + Avoid numeric lab values — instead, explain results conceptually (“Your blood sugar was higher than normal, which can mean…”).
            + Describe what treatments are recommended and why.
            + For medications: name, what it does, how often to take it, how long, and common side effects in simple terms.
            + Include lifestyle advice (diet, exercise, sleep, stress, smoking, alcohol) in positive, encouraging language.
            + Mention any procedures or therapies and explain what to expect.
        - doctor: Name of the doctor, or name of the medical facility/clinic if doctor name not available
        - confidence_score: A score between 0 and 100 indicating how certain you are about the information you extracted from the document

        Document text:
        {text_content[:8000]}  # Limit text to avoid token limits
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical document parser. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Low temperature for consistent parsing
            max_tokens=200
        )

        # Parse the response
        result_text = response.choices[0].message.content.strip()

        # Try to extract JSON from the response
        import json
        try:
            # Remove any markdown formatting if present
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            parsed_data = json.loads(result_text.strip())

            # Add file size to the response
            parsed_data['file_size'] = len(pdf_content)

            # Get confidence score
            confidence_score = parsed_data.get('confidence_score', 0)

            # Check if confidence score is below 51 - return error
            if confidence_score < 51:
                raise HTTPException(
                    status_code=400,
                    detail=f"Low confidence score ({confidence_score}). Unable to reliably extract appointment information."
                )

            # Check if any required fields are missing/empty
            required_fields = ['name', 'date', 'summary', 'doctor']
            missing_fields = [field for field in required_fields if not parsed_data.get(field, '').strip()]

            if missing_fields:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required fields: {', '.join(missing_fields)}. Confidence score: {confidence_score}"
                )

            # Handle appointment_type logic
            valid_types = [
                'General Checkup', 'Dental', 'Vision', 'Specialist', 'Vaccination',
                'Follow-up', 'Emergency', 'Lab Work', 'Physical Therapy', 'Mental Health', 'Veterinary', 'Other'
            ]

            appointment_type = parsed_data.get('appointment_type', '').strip()

            # If appointment_type is missing or invalid, and confidence is high enough, set to "Other"
            if not appointment_type or appointment_type not in valid_types[:-1]:  # Exclude "Other" from invalid check
                if confidence_score > 51:
                    parsed_data['appointment_type'] = 'Other'
                else:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Cannot determine appointment type and confidence score ({confidence_score}) is not high enough to use 'Other'"
                    )
            elif appointment_type not in valid_types:
                # This shouldn't happen with the above logic, but just in case
                raise HTTPException(
                    status_code=409,
                    detail=f"Invalid appointment type: {appointment_type}"
                )

            # Validate date format (basic check)
            date_str = parsed_data.get('date', '').strip()
            if not date_str or len(date_str.split('-')) != 3:
                parsed_data['date'] = datetime.now().strftime('%Y-%m-%d')

            appointment_data = AppointmentData(**parsed_data)

        except (json.JSONDecodeError, ValueError) as e:
            # Fallback if JSON parsing fails - this represents low confidence
            raise HTTPException(
                status_code=400,
                detail="Failed to parse JSON response from AI service. Unable to extract appointment information."
            )

        # Always save to database
        try:
            # Create database record with user reference
            db_appointment = ParsedAppointment(
                user_id=current_user.id,
                original_filename=file.filename,
                name=appointment_data.name,
                date=datetime.strptime(appointment_data.date, '%Y-%m-%d').date(),
                appointment_type=appointment_data.appointment_type,
                summary=appointment_data.summary,
                doctor=appointment_data.doctor,
                file_size=appointment_data.file_size,
                raw_file_data=pdf_content,  # Store the original PDF
                processing_status="completed",
                confidence_score=appointment_data.confidence_score
            )

            # Save to database using the injected session
            db.add(db_appointment)
            db.commit()
            db.refresh(db_appointment)

            # Add the database ID to the response
            response_data = appointment_data.model_dump()
            response_data['id'] = str(db_appointment.id)
            return JSONResponse(content=response_data)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except HTTPException:
        # Re-raise HTTPExceptions as they already have the correct status code
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.get("/parsed-appointments", response_model=List[ParsedAppointmentResponse])
async def get_parsed_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get all parsed appointments for the current user.

    Returns:
        List of user's parsed appointments with their details
    """
    try:
        # Query parsed appointments for the current user
        appointments = db.query(ParsedAppointment).filter(ParsedAppointment.user_id == current_user.id).all()

        # Convert to response format
        response_data = []
        for appointment in appointments:
            response_data.append(ParsedAppointmentResponse(
                id=str(appointment.id),
                original_filename=appointment.original_filename,
                name=appointment.name,
                date=appointment.date.isoformat(),
                appointment_type=appointment.appointment_type,
                summary=appointment.summary,
                doctor=appointment.doctor,
                file_size=appointment.file_size,
                processing_status=appointment.processing_status,
                confidence_score=appointment.confidence_score,
                created_at=appointment.created_at.isoformat(),
                updated_at=appointment.updated_at.isoformat()
            ))

        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
