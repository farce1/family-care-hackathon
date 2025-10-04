"""Upcoming appointments management tools for MCP server."""

import io
from datetime import datetime
from typing import Optional

import httpx
from fastmcp import FastMCP
from pydantic import BaseModel

from app.config import settings
from app.mcp.tools.auth import _auth_token

upcoming_router = FastMCP(name="Upcoming Appointments")


class UpcomingAppointment(BaseModel):
    nfz_id: str
    appointment_date: str
    appointment_time: str
    service_name: str
    service_provider: str
    location: str
    doctor: Optional[str] = None
    is_active: bool = True
    created_at: str


def get_auth_headers() -> dict:
    """Get authorization headers if token is available."""
    global _auth_token
    if _auth_token:
        return {"Authorization": f"Bearer {_auth_token}"}
    return {}


@upcoming_router.tool
async def upload_nfz_appointments(file_path: str) -> dict:
    """
    Upload and parse NFZ (Polish National Health Fund) appointments from a CSV file.
    The CSV should contain upcoming appointment information.

    Args:
        file_path: Path to the CSV file containing NFZ appointments

    Returns:
        Dictionary with parsing results and list of created appointments
    """
    try:
        # Read the CSV file
        with open(file_path, 'rb') as file:
            file_content = file.read()
            file_name = file_path.split('/')[-1]

        async with httpx.AsyncClient(timeout=60.0) as client:
            # Prepare multipart form data
            files = {
                'csv_file': (file_name, io.BytesIO(file_content), 'text/csv')
            }

            response = await client.post(
                f"{settings.backend_url}/upload-nfz-appointments",
                files=files,
                
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "success",
                    "message": data.get("message", "NFZ appointments uploaded successfully"),
                    "created_count": data.get("created_count", 0),
                    "skipped_count": data.get("skipped_count", 0),
                    "appointments": data.get("appointments", [])
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to upload NFZ appointments: {response.text}",
                    "status_code": response.status_code
                }
    except FileNotFoundError:
        return {
            "status": "error",
            "message": f"File not found: {file_path}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error processing CSV file: {str(e)}"
        }


@upcoming_router.tool
async def list_upcoming_appointments(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    service_name: Optional[str] = None,
    only_active: bool = True
) -> dict:
    """
    List all upcoming medical appointments from NFZ.
    Can filter by date range, service name, and active status.

    Args:
        start_date: Optional start date filter (YYYY-MM-DD format)
        end_date: Optional end date filter (YYYY-MM-DD format)
        service_name: Optional filter by service name
        only_active: If True, only show active appointments (default: True)

    Returns:
        Dictionary with list of upcoming appointments
    """
    async with httpx.AsyncClient() as client:
        try:
            # Build query parameters
            params = {}
            if start_date:
                params['start_date'] = start_date
            if end_date:
                params['end_date'] = end_date
            if service_name:
                params['service_name'] = service_name
            if only_active is not None:
                params['only_active'] = str(only_active).lower()

            response = await client.get(
                f"{settings.backend_url}/upcoming-appointments",
                params=params,
                
            )

            if response.status_code == 200:
                appointments = response.json()
                return {
                    "status": "success",
                    "count": len(appointments),
                    "appointments": appointments
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to fetch upcoming appointments: {response.text}",
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to backend: {str(e)}"
            }


@upcoming_router.tool
async def get_upcoming_appointment(nfz_id: str) -> dict:
    """
    Get details of a specific upcoming appointment by its NFZ ID.

    Args:
        nfz_id: The NFZ identifier of the appointment

    Returns:
        Dictionary with appointment details
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.backend_url}/upcoming-appointments/{nfz_id}",
                
            )

            if response.status_code == 200:
                return {
                    "status": "success",
                    "appointment": response.json()
                }
            elif response.status_code == 404:
                return {
                    "status": "error",
                    "message": f"Appointment with NFZ ID {nfz_id} not found"
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to fetch appointment: {response.text}",
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to backend: {str(e)}"
            }


@upcoming_router.tool
async def deactivate_appointment(nfz_id: str) -> dict:
    """
    Deactivate an upcoming appointment (mark as cancelled or completed).

    Args:
        nfz_id: The NFZ identifier of the appointment to deactivate

    Returns:
        Dictionary with deactivation status
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.put(
                f"{settings.backend_url}/upcoming-appointments/{nfz_id}/deactivate",
                
            )

            if response.status_code == 200:
                return {
                    "status": "success",
                    "message": f"Appointment {nfz_id} has been deactivated"
                }
            elif response.status_code == 404:
                return {
                    "status": "error",
                    "message": f"Appointment with NFZ ID {nfz_id} not found"
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to deactivate appointment: {response.text}",
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to backend: {str(e)}"
            }


@upcoming_router.tool
async def clear_all_upcoming_appointments() -> dict:
    """
    Delete ALL upcoming appointments for the current user.
    Use with caution - this action cannot be undone!

    Returns:
        Dictionary with deletion status and count of deleted appointments
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(
                f"{settings.backend_url}/upcoming-appointments",
                
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "success",
                    "message": data.get("message", "All appointments cleared"),
                    "deleted_count": data.get("deleted_count", 0)
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to clear appointments: {response.text}",
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to backend: {str(e)}"
            }


@upcoming_router.tool
async def get_next_appointments(count: int = 5) -> dict:
    """
    Get the next N upcoming appointments sorted by date and time.

    Args:
        count: Number of appointments to retrieve (default: 5)

    Returns:
        Dictionary with the next upcoming appointments
    """
    # Get all active appointments
    result = await list_upcoming_appointments(only_active=True)

    if result["status"] == "error":
        return result

    appointments = result.get("appointments", [])

    # Sort by date and time
    sorted_appointments = sorted(
        appointments,
        key=lambda x: (x.get("appointment_date", ""), x.get("appointment_time", ""))
    )

    # Take only the requested count
    next_appointments = sorted_appointments[:count]

    return {
        "status": "success",
        "requested_count": count,
        "found_count": len(next_appointments),
        "appointments": next_appointments
    }


@upcoming_router.tool
async def fetch_nfz_appointments(
    benefit: str,
    page: int = 1,
    limit: int = 10,
    province: str = "01"
) -> dict:
    """
    Fetch available appointments directly from NFZ (Polish National Health Fund) API.
    This retrieves real-time appointment availability for a specific medical specialty.

    Args:
        benefit: Medical specialty/benefit type (e.g., "PORADNIA ALERGOLOGICZNA", "PORADNIA KARDIOLOGICZNA")
        page: Page number for pagination (default: 1)
        limit: Number of results per page (default: 10, max: 100)
        province: Province code (default: "01" for Dolnośląskie)

    Returns:
        Dictionary with list of available appointments including provider, location, date, and wait times

    Examples:
        Fetch allergology appointments:
        >>> fetch_nfz_appointments(benefit="PORADNIA ALERGOLOGICZNA")

        Fetch cardiology appointments with more results:
        >>> fetch_nfz_appointments(benefit="PORADNIA KARDIOLOGICZNA", limit=20)
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Build query parameters
            params = {
                'benefit': benefit,
                'page': page,
                'limit': limit,
                'province': province
            }

            response = await client.get(
                f"{settings.backend_url}/fetch_nfz_appointments",
                params=params
            )

            if response.status_code == 200:
                data = response.json()
                appointments = data.get("appointments", [])

                return {
                    "status": "success",
                    "benefit": benefit,
                    "total": data.get("total", 0),
                    "count": len(appointments),
                    "page": page,
                    "limit": limit,
                    "appointments": appointments
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to fetch NFZ appointments: {response.text}",
                    "status_code": response.status_code
                }
        except httpx.TimeoutException:
            return {
                "status": "error",
                "message": "Request timed out while fetching NFZ appointments. The NFZ API may be slow or unavailable."
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to backend: {str(e)}"
            }