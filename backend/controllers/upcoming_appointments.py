from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import Optional, List
import sqlalchemy
from sqlalchemy import create_engine, Column, String, Integer, Date, Text, Boolean, TIMESTAMP, ForeignKey, UUID, BIGINT, \
    Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

# Database setup (reusing the same connection as your main app)
DATABASE_URL = "postgresql://familycare:familycare@postgres:5432/familycare"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class UpcomingAppointment(Base):
    __tablename__ = "upcoming_appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nfz_id = Column(String(255), nullable=False, unique=True)  # Original NFZ ID
    place = Column(String(500), nullable=False)
    provider = Column(String(500), nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=False)
    locality = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    benefit = Column(String(500), nullable=False)
    average_wait_days = Column(Integer, nullable=False, default=0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class NFZAppointmentData(BaseModel):
    id: str
    place: str
    provider: str
    phone: Optional[str] = None
    address: str
    locality: str
    date: str  # Will be converted to date format
    benefit: str
    averageWaitDays: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UpcomingAppointmentResponse(BaseModel):
    id: str
    nfz_id: str
    place: str
    provider: str
    phone: Optional[str]
    address: str
    locality: str
    date: str
    benefit: str
    average_wait_days: int
    latitude: Optional[float]
    longitude: Optional[float]
    is_active: bool
    created_at: str
    updated_at: str


class BulkUploadResponse(BaseModel):
    success: bool
    total_processed: int
    new_records: int
    updated_records: int
    errors: List[str] = []


# Create router
router = APIRouter()


@router.post("/upload-nfz-appointments")
async def upload_nfz_appointments(appointments: List[NFZAppointmentData]):
    """
    Upload a list of NFZ appointments to the database.
    Updates existing records if NFZ ID already exists, creates new ones otherwise.

    Parameters:
        appointments: List of NFZ appointment data

    Returns:
        success: Boolean indicating if operation completed
        total_processed: Total number of appointments processed
        new_records: Number of new appointments created
        updated_records: Number of existing appointments updated
        errors: List of any errors encountered
    """
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")

    db = SessionLocal()
    new_records = 0
    updated_records = 0
    errors = []

    try:
        for appointment_data in appointments:
            try:
                # Parse the date string to date object
                try:
                    appointment_date = datetime.strptime(appointment_data.date, '%Y-%m-%d').date()
                except ValueError:
                    # Try alternative date formats if needed
                    try:
                        appointment_date = datetime.strptime(appointment_data.date, '%d-%m-%Y').date()
                    except ValueError:
                        errors.append(
                            f"Invalid date format for appointment {appointment_data.id}: {appointment_data.date}")
                        continue

                # Check if appointment already exists
                existing_appointment = db.query(UpcomingAppointment).filter(
                    UpcomingAppointment.nfz_id == appointment_data.id
                ).first()

                if existing_appointment:
                    # Update existing record
                    existing_appointment.place = appointment_data.place
                    existing_appointment.provider = appointment_data.provider
                    existing_appointment.phone = appointment_data.phone
                    existing_appointment.address = appointment_data.address
                    existing_appointment.locality = appointment_data.locality
                    existing_appointment.date = appointment_date
                    existing_appointment.benefit = appointment_data.benefit
                    existing_appointment.average_wait_days = appointment_data.averageWaitDays
                    existing_appointment.latitude = appointment_data.latitude
                    existing_appointment.longitude = appointment_data.longitude
                    existing_appointment.is_active = True
                    existing_appointment.updated_at = datetime.utcnow()

                    updated_records += 1
                else:
                    # Create new record
                    new_appointment = UpcomingAppointment(
                        nfz_id=appointment_data.id,
                        place=appointment_data.place,
                        provider=appointment_data.provider,
                        phone=appointment_data.phone,
                        address=appointment_data.address,
                        locality=appointment_data.locality,
                        date=appointment_date,
                        benefit=appointment_data.benefit,
                        average_wait_days=appointment_data.averageWaitDays,
                        latitude=appointment_data.latitude,
                        longitude=appointment_data.longitude,
                        is_active=True
                    )

                    db.add(new_appointment)
                    new_records += 1

            except Exception as e:
                errors.append(f"Error processing appointment {appointment_data.id}: {str(e)}")
                continue

        # Commit all changes
        db.commit()

        response_data = BulkUploadResponse(
            success=len(errors) == 0,
            total_processed=len(appointments),
            new_records=new_records,
            updated_records=updated_records,
            errors=errors
        )

        return JSONResponse(content=response_data.model_dump())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()


@router.get("/upcoming-appointments", response_model=List[UpcomingAppointmentResponse])
async def get_upcoming_appointments(
        locality: Optional[str] = None,
        benefit: Optional[str] = None,
        max_wait_days: Optional[int] = None,
        active_only: bool = True
):
    """
    Get upcoming appointments with optional filtering.

    Parameters:
        locality: Filter by locality/city
        benefit: Filter by benefit type
        max_wait_days: Filter by maximum waiting days
        active_only: Only return active appointments (default: True)

    Returns:
        List of upcoming appointments matching the filters
    """
    db = SessionLocal()
    try:
        # Base query
        query = db.query(UpcomingAppointment)

        # Apply filters
        if active_only:
            query = query.filter(UpcomingAppointment.is_active == True)

        if locality:
            query = query.filter(UpcomingAppointment.locality.ilike(f"%{locality}%"))

        if benefit:
            query = query.filter(UpcomingAppointment.benefit.ilike(f"%{benefit}%"))

        if max_wait_days is not None:
            query = query.filter(UpcomingAppointment.average_wait_days <= max_wait_days)

        # Order by date and waiting days
        appointments = query.order_by(
            UpcomingAppointment.date.asc(),
            UpcomingAppointment.average_wait_days.asc()
        ).all()

        # Convert to response format
        response_data = []
        for appointment in appointments:
            response_data.append(UpcomingAppointmentResponse(
                id=str(appointment.id),
                nfz_id=appointment.nfz_id,
                place=appointment.place,
                provider=appointment.provider,
                phone=appointment.phone,
                address=appointment.address,
                locality=appointment.locality,
                date=appointment.date.isoformat(),
                benefit=appointment.benefit,
                average_wait_days=appointment.average_wait_days,
                latitude=appointment.latitude,
                longitude=appointment.longitude,
                is_active=appointment.is_active,
                created_at=appointment.created_at.isoformat(),
                updated_at=appointment.updated_at.isoformat()
            ))

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()


@router.get("/upcoming-appointments/{nfz_id}", response_model=UpcomingAppointmentResponse)
async def get_upcoming_appointment(nfz_id: str):
    """
    Get a specific upcoming appointment by NFZ ID.

    Parameters:
        nfz_id: The NFZ ID of the appointment

    Returns:
        The appointment details
    """
    db = SessionLocal()
    try:
        appointment = db.query(UpcomingAppointment).filter(
            UpcomingAppointment.nfz_id == nfz_id
        ).first()

        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")

        return UpcomingAppointmentResponse(
            id=str(appointment.id),
            nfz_id=appointment.nfz_id,
            place=appointment.place,
            provider=appointment.provider,
            phone=appointment.phone,
            address=appointment.address,
            locality=appointment.locality,
            date=appointment.date.isoformat(),
            benefit=appointment.benefit,
            average_wait_days=appointment.average_wait_days,
            latitude=appointment.latitude,
            longitude=appointment.longitude,
            is_active=appointment.is_active,
            created_at=appointment.created_at.isoformat(),
            updated_at=appointment.updated_at.isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()