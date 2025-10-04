import httpx
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from fastapi import HTTPException, APIRouter
from fastapi.responses import JSONResponse
import logging
from datetime import datetime
import json
import uuid

# Import your existing models and classes
from models import Base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, Column, String, Integer, Date, Text, Boolean, TIMESTAMP, UUID, Float

# Use your existing database setup
DATABASE_URL = "postgresql://familycare:familycare@postgres:5432/familycare"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

logger = logging.getLogger(__name__)


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

# Python equivalent of TypeScript interfaces
class NFZQueueParams(BaseModel):
    """Python equivalent of NFZQueueParams interface"""
    page: Optional[int] = 1
    limit: Optional[int] = 10
    format: Optional[str] = 'json'  # 'json' | 'xml'
    case: Optional[int] = 1
    province: Optional[str] = '01'
    benefit: Optional[str] = None
    benefitForChildren: Optional[bool] = None
    apiVersion: Optional[str] = None


class NFZDateInfo(BaseModel):
    """Python equivalent of dates object in NFZ API"""
    applicable: Optional[bool] = None
    date: Optional[str] = None
    date_situation_as_at: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        fields = {
            'date_situation_as_at': 'date-situation-as-at'
        }


class NFZProviderData(BaseModel):
    """Python equivalent of provider-data statistics"""
    awaiting: Optional[int] = 0
    removed: Optional[int] = 0
    average_period: Optional[int] = 0
    update: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        fields = {
            'average_period': 'average-period'
        }


class NFZStatistics(BaseModel):
    """Python equivalent of statistics object"""
    provider_data: Optional[NFZProviderData] = None
    computed_data: Optional[Any] = None

    class Config:
        allow_population_by_field_name = True
        fields = {
            'provider_data': 'provider-data',
            'computed_data': 'computed-data'
        }


class NFZAttributes(BaseModel):
    """Python equivalent of attributes object in NFZ API response"""
    case: Optional[int] = None
    benefit: Optional[str] = ""
    provider: Optional[str] = ""
    place: Optional[str] = ""
    address: Optional[str] = ""
    locality: Optional[str] = ""
    phone: Optional[str] = ""
    latitude: Optional[Union[float, str]] = None  # Can be float, string, or None
    longitude: Optional[Union[float, str]] = None  # Can be float, string, or None
    dates: Optional[NFZDateInfo] = None
    statistics: Optional[NFZStatistics] = None

    class Config:
        extra = "allow"  # Equivalent to [key: string]: unknown


class NFZQueueItem(BaseModel):
    """Python equivalent of NFZQueueItem interface"""
    type: Optional[str] = ""
    id: Optional[str] = ""
    attributes: Optional[NFZAttributes] = None


class NFZLinks(BaseModel):
    """Python equivalent of links object in API response"""
    first: Optional[str] = ""
    prev: Optional[str] = None
    self: Optional[str] = ""
    next: Optional[str] = ""
    last: Optional[str] = ""


class NFZMeta(BaseModel):
    """Python equivalent of meta object in API response"""
    count: Optional[int] = 0
    page: Optional[int] = 1
    limit: Optional[int] = 10

    class Config:
        extra = "allow"  # Equivalent to [key: string]: unknown


class NFZApiResponse(BaseModel):
    """Python equivalent of NFZApiResponse interface"""
    meta: Optional[NFZMeta] = None
    links: Optional[NFZLinks] = None
    data: Optional[List[NFZQueueItem]] = []


class ParsedNFZItem(BaseModel):
    """Python equivalent of ParsedNFZItem interface"""
    id: str
    place: str
    provider: str
    phone: str
    address: str
    locality: str
    date: str
    benefit: str
    averageWaitDays: int
    latitude: Optional[Union[float, str]] = None  # Allow both float and string
    longitude: Optional[Union[float, str]] = None  # Allow both float and string


class NFZService:
    """Python equivalent of the TypeScript NFZ functions"""

    BASE_URL = "https://api.nfz.gov.pl/app-itl-api/queues"

    @staticmethod
    def safe_convert_coordinate(value: Any) -> str:
        """Safely convert coordinate value to string"""
        if value is None:
            return "0"
        if isinstance(value, (int, float)):
            return str(value)
        if isinstance(value, str):
            return value
        return "0"

    @staticmethod
    async def get_nfz_queues(params: NFZQueueParams = None) -> List[ParsedNFZItem]:
        """
        Python equivalent of getNFZQueues function.
        Fetches NFZ queue data and returns parsed items.
        """
        if params is None:
            params = NFZQueueParams()

        # Default parameters - equivalent to TypeScript defaultParams
        default_params = NFZQueueParams(
            page=1,
            limit=10,  # Increased to get more results
            format='json',
            case=1,
            province='01',
            benefit='PORADNIA ALERGOLOGICZNA',
            benefitForChildren=False,
            apiVersion='1.3'
        )

        # Merge parameters - equivalent to { ...defaultParams, ...params }
        final_params = {}

        # Add default values first
        for field, value in default_params.dict().items():
            if value is not None:
                final_params[field] = value

        # Override with provided params
        for field, value in params.dict().items():
            if value is not None:
                final_params[field] = value

        # Build query parameters
        query_params = {}

        if final_params.get('page'):
            query_params['page'] = str(final_params['page'])
        if final_params.get('limit'):
            query_params['limit'] = str(final_params['limit'])
        if final_params.get('format'):
            query_params['format'] = final_params['format']
        if final_params.get('case'):
            query_params['case'] = str(final_params['case'])
        if final_params.get('province'):
            query_params['province'] = final_params['province']
        if final_params.get('benefit'):
            query_params['benefit'] = final_params['benefit']
        if final_params.get('benefitForChildren') is not None:
            query_params['benefitForChildren'] = str(final_params['benefitForChildren']).lower()
        if final_params.get('apiVersion'):
            query_params['api-version'] = final_params['apiVersion']

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    NFZService.BASE_URL,
                    params=query_params,
                    headers={
                        'accept': 'text/plain',
                        'Content-Type': 'application/json'
                    }
                )

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"HTTP error! status: {response.status_code}"
                    )

                # Parse JSON response
                api_data_dict = response.json()

                # Safety check - equivalent to TypeScript safety check
                if not api_data_dict.get('data') or not isinstance(api_data_dict['data'], list):
                    logger.warning('No data found in API response')
                    return []

                parsed_list: List[ParsedNFZItem] = []

                # Updated loop to match actual API structure - equivalent to TypeScript for loop
                for i in range(len(api_data_dict['data'])):
                    item = api_data_dict['data'][i]
                    attrs = item.get('attributes', {})  # The actual data is in 'attributes'

                    # Extract statistics safely
                    statistics = attrs.get('statistics', {})
                    provider_data = statistics.get('provider-data', {})
                    dates = attrs.get('dates', {})

                    # Convert coordinates safely
                    latitude_val = NFZService.safe_convert_coordinate(attrs.get('latitude'))
                    longitude_val = NFZService.safe_convert_coordinate(attrs.get('longitude'))

                    parsed_item = ParsedNFZItem(
                        id=item.get('id', ''),
                        place=attrs.get('place', 'Unknown place'),
                        provider=attrs.get('provider', 'Unknown provider'),
                        phone=attrs.get('phone', 'No phone'),
                        address=attrs.get('address', 'No address'),
                        locality=attrs.get('locality', 'Unknown city'),
                        date=dates.get('date', 'No date available'),
                        benefit=attrs.get('benefit', 'Unknown benefit'),
                        averageWaitDays=provider_data.get('average-period', 0),
                        latitude=latitude_val,
                        longitude=longitude_val
                    )

                    parsed_list.append(parsed_item)

                return parsed_list

            except httpx.RequestError as error:
                logger.error(f'Error fetching NFZ queue data: {error}')
                raise HTTPException(
                    status_code=503,
                    detail=f'Error fetching NFZ queue data: {str(error)}'
                )
            except Exception as error:
                logger.error(f'Unexpected error: {error}')
                raise HTTPException(
                    status_code=500,
                    detail=f'Unexpected error: {str(error)}'
                )

    @staticmethod
    async def main_test():
        """
        Python equivalent of the main() function from TypeScript.
        Tests the NFZ API with correct structure.
        """
        print('🏥 Testing NFZ API with correct structure...\n')

        try:
            params = NFZQueueParams(benefit="PORADNIA ALERGOLOGICZNA")
            results = await NFZService.get_nfz_queues(params)

            print('✅ API call successful!')
            print('📊 Results:')
            print(f'Number of clinics found: {len(results)}')

            for index, clinic in enumerate(results):
                print(f'\n--- Clinic {index + 1} ---')
                print(f'ID: {clinic.id}')
                print(f'Provider: {clinic.provider}')
                print(f'Place: {clinic.place}')
                print(f'City: {clinic.locality}')
                print(f'Address: {clinic.address}')
                print(f'Phone: {clinic.phone}')
                print(f'Next available: {clinic.date}')
                print(f'Average wait (days): {clinic.averageWaitDays}')
                print(f'Location: {clinic.latitude}, {clinic.longitude}')

            print('\n🔍 Raw parsed data:')
            # Convert to dict for JSON serialization
            results_dict = [result.dict() for result in results]
            print(json.dumps(results_dict, indent=2, ensure_ascii=False))

            return results

        except Exception as error:
            print(f'❌ Test failed: {error}')
            raise

    @staticmethod
    def process_appointment_to_db(appointment_data: ParsedNFZItem, db) -> tuple[bool, str]:
        """
        Helper function to process a single appointment and save to database.
        Converts ParsedNFZItem to database format.
        Returns (is_new_record, error_message)
        """
        try:
            # Convert coordinates to float for database storage
            latitude_float = None
            longitude_float = None

            try:
                if appointment_data.latitude and str(appointment_data.latitude) not in ['0', '']:
                    latitude_float = float(appointment_data.latitude)
            except (ValueError, TypeError):
                latitude_float = None

            try:
                if appointment_data.longitude and str(appointment_data.longitude) not in ['0', '']:
                    longitude_float = float(appointment_data.longitude)
            except (ValueError, TypeError):
                longitude_float = None

            # Parse the date string to date object
            appointment_date = None
            try:
                appointment_date = datetime.strptime(appointment_data.date, '%Y-%m-%d').date()
            except ValueError:
                try:
                    appointment_date = datetime.strptime(appointment_data.date, '%d-%m-%Y').date()
                except ValueError:
                    return False, f"Invalid date format: {appointment_data.date}"

            # Check if appointment already exists
            existing_appointment = db.query(UpcomingAppointment).filter(
                UpcomingAppointment.nfz_id == appointment_data.id
            ).first()

            if existing_appointment:
                # Update existing record
                existing_appointment.place = appointment_data.place
                existing_appointment.provider = appointment_data.provider
                existing_appointment.phone = appointment_data.phone if appointment_data.phone != "No phone" else None
                existing_appointment.address = appointment_data.address
                existing_appointment.locality = appointment_data.locality
                existing_appointment.date = appointment_date
                existing_appointment.benefit = appointment_data.benefit
                existing_appointment.waiting_people = 0  # Default value
                existing_appointment.average_wait_days = appointment_data.averageWaitDays
                existing_appointment.latitude = latitude_float
                existing_appointment.longitude = longitude_float
                existing_appointment.is_active = True
                existing_appointment.updated_at = datetime.utcnow()

                return False, ""  # Not a new record, no error
            else:
                # Create new record
                new_appointment = UpcomingAppointment(
                    nfz_id=appointment_data.id,
                    place=appointment_data.place,
                    provider=appointment_data.provider,
                    phone=appointment_data.phone if appointment_data.phone != "No phone" else None,
                    address=appointment_data.address,
                    locality=appointment_data.locality,
                    date=appointment_date,
                    benefit=appointment_data.benefit,
                    waiting_people=0,  # Default value
                    average_wait_days=appointment_data.averageWaitDays,
                    latitude=latitude_float,
                    longitude=longitude_float,
                    is_active=True
                )

                db.add(new_appointment)
                return True, ""  # New record, no error

        except Exception as e:
            return False, f"Error processing appointment {appointment_data.id}: {str(e)}"


# Add these new endpoints to your existing router
router = APIRouter()


@router.post("/add_appointment")
async def fetch_and_upload_nfz(
        page: Optional[int] = 1,
        limit: Optional[int] = 10,
        format: Optional[str] = "json",
        case: Optional[int] = 1,
        province: Optional[str] = "01",
        benefit: Optional[str] = "PORADNIA ALERGOLOGICZNA",
        benefitForChildren: Optional[bool] = False,
        apiVersion: Optional[str] = "1.3"
):
    """
    Fetches NFZ data using the working GET logic and uploads to database.
    This reuses the proven fetch logic from fetch-nfz-queues-raw.
    """
    try:
        # Use the exact same parameter construction as the working GET endpoint
        params = NFZQueueParams(
            page=page,
            limit=limit,
            format=format,
            case=case,
            province=province,
            benefit=benefit,
            benefitForChildren=benefitForChildren,
            apiVersion=apiVersion
        )

        # Use the working fetch logic
        appointments = await NFZService.get_nfz_queues(params)

        if not appointments:
            return JSONResponse(content={
                "success": True,
                "message": "No appointments found from NFZ API",
                "total_processed": 0,
                "new_records": 0,
                "updated_records": 0,
                "errors": []
            })

        # Now upload to database
        db = SessionLocal()
        new_records = 0
        updated_records = 0
        errors = []

        try:
            for appointment_data in appointments:
                is_new, error_msg = NFZService.process_appointment_to_db(appointment_data, db)

                if error_msg:
                    errors.append(error_msg)
                elif is_new:
                    new_records += 1
                else:
                    updated_records += 1

            # Commit all changes
            db.commit()

            return JSONResponse(content={
                "success": len(errors) == 0,
                "total_processed": len(appointments),
                "new_records": new_records,
                "updated_records": updated_records,
                "errors": errors,
                "fetched_data_sample": [appointment.dict() for appointment in appointments[:3]]
                # Include first 3 for verification
            })

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            db.close()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/save_appointment")
async def save_single_appointment(appointment: ParsedNFZItem):
    """
    Save a single NFZ appointment to the database.
    Accepts appointment data and stores it in the upcoming_appointments table.

    Args:
        appointment: ParsedNFZItem containing the appointment details

    Returns:
        Dictionary with save status and appointment details
    """
    db = SessionLocal()
    try:
        is_new, error_msg = NFZService.process_appointment_to_db(appointment, db)

        if error_msg:
            db.rollback()
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "message": error_msg
                }
            )

        db.commit()

        # Fetch the saved appointment
        saved_appointment = db.query(UpcomingAppointment).filter(
            UpcomingAppointment.nfz_id == appointment.id
        ).first()

        if saved_appointment:
            return {
                "success": True,
                "message": "Appointment saved successfully" if is_new else "Appointment already exists and was updated",
                "is_new": is_new,
                "appointment": {
                    "id": str(saved_appointment.id),
                    "nfz_id": saved_appointment.nfz_id,
                    "place": saved_appointment.place,
                    "provider": saved_appointment.provider,
                    "phone": saved_appointment.phone,
                    "address": saved_appointment.address,
                    "locality": saved_appointment.locality,
                    "date": saved_appointment.date.isoformat(),
                    "benefit": saved_appointment.benefit,
                    "average_wait_days": saved_appointment.average_wait_days
                }
            }
        else:
            return {
                "success": False,
                "message": "Failed to retrieve saved appointment"
            }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()


@router.get("/fetch_nfz_appointments")
async def fetch_nfz_appointments(
        page: Optional[int] = 1,
        limit: Optional[int] = 10,
        format: Optional[str] = "json",
        case: Optional[int] = 1,
        province: Optional[str] = "01",
        benefit: Optional[str] = "PORADNIA ALERGOLOGICZNA",
        benefitForChildren: Optional[bool] = False,
        apiVersion: Optional[str] = "1.3"
):
    """
    Fetches appointments directly from NFZ API without saving to database.
    Returns the raw NFZ data as parsed items.

    Query Parameters:
    - page: Page number (default: 1)
    - limit: Results per page (default: 10)
    - format: Response format (default: json)
    - case: Case type (default: 1)
    - province: Province code (default: 01)
    - benefit: Medical specialty/benefit type
    - benefitForChildren: Whether it's for children (default: False)
    - apiVersion: NFZ API version (default: 1.3)
    """
    try:
        # Create params object
        params = NFZQueueParams(
            page=page,
            limit=limit,
            format=format,
            case=case,
            province=province,
            benefit=benefit,
            benefitForChildren=benefitForChildren,
            apiVersion=apiVersion
        )

        # Fetch from NFZ API
        appointments = await NFZService.get_nfz_queues(params)

        if not appointments:
            return JSONResponse(content={
                "success": True,
                "message": "No appointments found from NFZ API",
                "total": 0,
                "appointments": []
            })

        # Format response - convert ParsedNFZItem to dict
        response_data = []
        for appointment in appointments:
            response_data.append({
                "id": appointment.id,
                "place": appointment.place,
                "provider": appointment.provider,
                "phone": appointment.phone,
                "address": appointment.address,
                "locality": appointment.locality,
                "date": appointment.date,
                "benefit": appointment.benefit,
                "averageWaitDays": appointment.averageWaitDays,
                "latitude": appointment.latitude,
                "longitude": appointment.longitude
            })

        return {
            "success": True,
            "total": len(response_data),
            "appointments": response_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching NFZ appointments: {str(e)}")


@router.get("/upcoming_appointments")
async def get_appointments(
        locality: Optional[str] = None,
        benefit: Optional[str] = None,
        province: Optional[str] = None,
        max_wait_days: Optional[int] = None,
        min_wait_days: Optional[int] = None,
        active_only: bool = True,
        limit: Optional[int] = 100,
        offset: Optional[int] = 0,
        sort_by: Optional[str] = "date",  # "date", "wait_days", "created_at"
        sort_order: Optional[str] = "asc"  # "asc" or "desc"
):
    """
    Get stored appointments with comprehensive filtering and sorting options.

    Query Parameters:
    - locality: Filter by city/locality (partial match)
    - benefit: Filter by benefit type (partial match)
    - province: Filter by province code (01, 02, etc.)
    - max_wait_days: Maximum average wait days
    - min_wait_days: Minimum average wait days
    - active_only: Only return active appointments (default: True)
    - limit: Maximum number of results (default: 100)
    - offset: Number of records to skip for pagination
    - sort_by: Sort field (date, wait_days, created_at)
    - sort_order: Sort direction (asc, desc)
    """
    db = SessionLocal()
    try:
        query = db.query(UpcomingAppointment)

        # Apply filters
        if active_only:
            query = query.filter(UpcomingAppointment.is_active == True)

        if locality:
            query = query.filter(UpcomingAppointment.locality.ilike(f"%{locality}%"))

        if benefit:
            query = query.filter(UpcomingAppointment.benefit.ilike(f"%{benefit}%"))

        if province:
            # Assuming province info might be in locality or we could add a province field
            query = query.filter(UpcomingAppointment.locality.ilike(f"%{province}%"))

        if max_wait_days is not None:
            query = query.filter(UpcomingAppointment.average_wait_days <= max_wait_days)

        if min_wait_days is not None:
            query = query.filter(UpcomingAppointment.average_wait_days >= min_wait_days)

        # Apply sorting
        if sort_by == "wait_days":
            sort_column = UpcomingAppointment.average_wait_days
        elif sort_by == "created_at":
            sort_column = UpcomingAppointment.created_at
        else:  # default to date
            sort_column = UpcomingAppointment.date

        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Get total count before applying limit/offset
        total_count = query.count()

        # Apply pagination
        appointments = query.offset(offset).limit(limit).all()

        # Format response
        response_data = []
        for appointment in appointments:
            response_data.append({
                "id": str(appointment.id),
                "nfz_id": appointment.nfz_id,
                "place": appointment.place,
                "provider": appointment.provider,
                "phone": appointment.phone,
                "address": appointment.address,
                "locality": appointment.locality,
                "date": appointment.date.isoformat(),
                "benefit": appointment.benefit,
                "waiting_people": appointment.waiting_people,
                "average_wait_days": appointment.average_wait_days,
                "latitude": appointment.latitude,
                "longitude": appointment.longitude,
                "is_active": appointment.is_active,
                "created_at": appointment.created_at.isoformat(),
                "updated_at": appointment.updated_at.isoformat()
            })

        return {
            "success": True,
            "total_count": total_count,
            "returned_count": len(response_data),
            "offset": offset,
            "limit": limit,
            "appointments": response_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()