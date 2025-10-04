from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
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

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("API_KEY"))

# Database setup
DATABASE_URL = "postgresql://familycare:familycare@postgres:5432/familycare"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models
from models import ParsedAppointment

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
async def parse_pdf(file: UploadFile = File(...)):
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

        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text_content = ""

        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n"

        if not text_content.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        # Use ChatGPT to parse the appointment data
        prompt = f"""
        Extract appointment information from the following medical document text.
        Return ONLY a JSON object with exactly these fields:
        - name: Title or name of the appointment/medical report (e.g., "Dermatology Consultation", "Blood Test Results")
        - date: The appointment date in YYYY-MM-DD format (extract from the document)
        - appointment_type: Must be one of these exact values: 'General Checkup', 'Dental', 'Vision', 'Specialist', 'Vaccination', 'Follow-up', 'Emergency', 'Lab Work', 'Physical Therapy', 'Mental Health', 'Veterinary'
        - summary: Brief summary of the appointment findings, diagnosis, or medical recommendations
        - doctor: Name of the doctor, or name of the medical facility/clinic if doctor name not available
        - confidence_score: A score between 0 and 100 indicating how certain you are about the information you extracted from the document

        Document text:
        {text_content[:4000]}  # Limit text to avoid token limits
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
            # Create database record
            db_appointment = ParsedAppointment(
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

            # Save to database
            db = SessionLocal()
            try:
                db.add(db_appointment)
                db.commit()
                db.refresh(db_appointment)
                # Add the database ID to the response
                response_data = appointment_data.model_dump()
                response_data['id'] = str(db_appointment.id)
                return JSONResponse(content=response_data)
            finally:
                db.close()

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except HTTPException:
        # Re-raise HTTPExceptions as they already have the correct status code
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.get("/parsed-appointments", response_model=List[ParsedAppointmentResponse])
async def get_parsed_appointments():
    """
    Get all parsed appointments from the database.

    Returns:
        List of all parsed appointments with their details
    """
    db = SessionLocal()
    try:
        # Query all parsed appointments
        appointments = db.query(ParsedAppointment).all()

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
    finally:
        db.close()
