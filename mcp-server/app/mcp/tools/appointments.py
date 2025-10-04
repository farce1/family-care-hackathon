"""Appointment management tools for MCP server."""

import base64
import io
from datetime import datetime
from typing import Optional

import httpx
from fastmcp import FastMCP
from pydantic import BaseModel

from app.config import settings
from app.mcp.tools.auth import _auth_token

appointments_router = FastMCP(name="Appointments")


class ParsedAppointment(BaseModel):
    id: str
    name: str
    date: str
    appointment_type: str
    summary: Optional[str] = ""
    doctor: Optional[str] = ""
    confidence_score: int = 0
    original_filename: str
    file_size: int
    created_at: str


def get_auth_headers() -> dict:
    """Get authorization headers if token is available."""
    global _auth_token
    if _auth_token:
        return {"Authorization": f"Bearer {_auth_token}"}
    return {}


@appointments_router.tool
async def parse_pdf_appointment(file_path: str) -> dict:
    """
    Parse a PDF file containing medical appointment information.
    Extracts appointment details using AI processing.

    Args:
        file_path: Path to the PDF file to parse

    Returns:
        Dictionary with parsed appointment information including:
        - name: Document/appointment name
        - date: Appointment date
        - appointment_type: Type of appointment
        - summary: AI-generated summary
        - doctor: Doctor's name if found
        - confidence_score: AI confidence in the extraction
    """
    try:
        # Read the PDF file
        with open(file_path, 'rb') as file:
            file_content = file.read()
            file_name = file_path.split('/')[-1]

        async with httpx.AsyncClient(timeout=60.0) as client:
            # Prepare multipart form data
            files = {
                'pdf_file': (file_name, io.BytesIO(file_content), 'application/pdf')
            }

            response = await client.post(
                f"{settings.backend_url}/parse-pdf",
                files=files,
                headers=get_auth_headers()
            )

            if response.status_code == 200:
                return {
                    "status": "success",
                    "message": "PDF parsed successfully",
                    "appointment": response.json()
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to parse PDF: {response.text}",
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
            "message": f"Error processing PDF: {str(e)}"
        }


@appointments_router.tool
async def list_parsed_appointments(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    appointment_type: Optional[str] = None
) -> dict:
    """
    List all parsed medical appointments for the current user.
    Can filter by date range and appointment type.

    Args:
        start_date: Optional start date filter (YYYY-MM-DD format)
        end_date: Optional end date filter (YYYY-MM-DD format)
        appointment_type: Optional filter by appointment type

    Returns:
        Dictionary with list of parsed appointments
    """
    async with httpx.AsyncClient() as client:
        try:
            # Build query parameters
            params = {}
            if start_date:
                params['start_date'] = start_date
            if end_date:
                params['end_date'] = end_date
            if appointment_type:
                params['appointment_type'] = appointment_type

            response = await client.get(
                f"{settings.backend_url}/parsed-appointments",
                params=params,
                headers=get_auth_headers()
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
                    "message": f"Failed to fetch appointments: {response.text}",
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to backend: {str(e)}"
            }


@appointments_router.tool
async def search_appointments(query: str) -> dict:
    """
    Search for appointments by doctor name, summary content, or appointment name.

    Args:
        query: Search query string

    Returns:
        Dictionary with matching appointments
    """
    # Get all appointments and filter locally
    result = await list_parsed_appointments()

    if result["status"] == "error":
        return result

    query_lower = query.lower()
    matching = []

    for appointment in result.get("appointments", []):
        # Search in various fields
        if (
            query_lower in appointment.get("name", "").lower() or
            query_lower in appointment.get("doctor", "").lower() or
            query_lower in appointment.get("summary", "").lower() or
            query_lower in appointment.get("appointment_type", "").lower()
        ):
            matching.append(appointment)

    return {
        "status": "success",
        "query": query,
        "count": len(matching),
        "appointments": matching
    }


@appointments_router.tool
async def get_appointment_summary(appointment_id: str) -> dict:
    """
    Get detailed summary and information about a specific parsed appointment.

    Args:
        appointment_id: ID of the appointment to retrieve

    Returns:
        Dictionary with detailed appointment information
    """
    # Get all appointments and find the specific one
    result = await list_parsed_appointments()

    if result["status"] == "error":
        return result

    for appointment in result.get("appointments", []):
        if appointment.get("id") == appointment_id:
            return {
                "status": "success",
                "appointment": appointment
            }

    return {
        "status": "error",
        "message": f"Appointment with ID {appointment_id} not found"
    }