from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

# Import Base and database setup from models
from models import Base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Database setup
DATABASE_URL = "postgresql://familycare:familycare@postgres:5432/familycare"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import SQLAlchemy components for the new model
from sqlalchemy import Column, String, Integer, Date, Text, Boolean, TIMESTAMP, UUID, Float


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
    waiting_people = Column(Integer, nullable=False, default=0)
    average_wait_days = Column(Integer, nullable=False, default=0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class NFZAppointmentData(BaseModel):
    id: str
    place: str
    provider: str
    phone: Optional[str] = None
    address: str
    locality: str
    date: str  # Will be converted to date format
    benefit: str
    waitingPeople: int
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
    waiting_people: int
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
                    existing_appointment.waiting_people = appointment_data.waitingPeople
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
                        waiting_people=appointment_data.waitingPeople,
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
    """Get upcoming appointments with optional filtering."""
    db = SessionLocal()
    try:
        query = db.query(UpcomingAppointment)

        if active_only:
            query = query.filter(UpcomingAppointment.is_active == True)

        if locality:
            query = query.filter(UpcomingAppointment.locality.ilike(f"%{locality}%"))

        if benefit:
            query = query.filter(UpcomingAppointment.benefit.ilike(f"%{benefit}%"))

        if max_wait_days is not None:
            query = query.filter(UpcomingAppointment.average_wait_days <= max_wait_days)

        appointments = query.order_by(
            UpcomingAppointment.date.asc(),
            UpcomingAppointment.average_wait_days.asc()
        ).all()

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
                waiting_people=appointment.waiting_people,
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
    """Get a specific upcoming appointment by NFZ ID."""
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
            waiting_people=appointment.waiting_people,
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


@router.put("/upcoming-appointments/{nfz_id}/deactivate")
async def deactivate_appointment(nfz_id: str):
    """Mark an upcoming appointment as inactive."""
    db = SessionLocal()
    try:
        appointment = db.query(UpcomingAppointment).filter(
            UpcomingAppointment.nfz_id == nfz_id
        ).first()

        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")

        appointment.is_active = False
        appointment.updated_at = datetime.utcnow()
        db.commit()

        return JSONResponse(content={"message": "Appointment deactivated successfully"})

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()


@router.delete("/upcoming-appointments")
async def clear_inactive_appointments():
    """Delete all inactive appointments from the database."""
    db = SessionLocal()
    try:
        deleted_count = db.query(UpcomingAppointment).filter(
            UpcomingAppointment.is_active == False
        ).delete()

        db.commit()

        return JSONResponse(content={
            "message": f"Deleted {deleted_count} inactive appointments",
            "deleted_count": deleted_count
        })

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()