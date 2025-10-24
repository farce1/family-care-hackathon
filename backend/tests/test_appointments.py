from datetime import date, datetime
from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient

from controllers.appointments import ParsedAppointment
from main import app

client = TestClient(app)


class TestParsedAppointments:
    @patch("controllers.appointments.SessionLocal")
    def test_get_parsed_appointments_with_data(self, mock_session_local):
        """Test getting parsed appointments when data exists"""
        # Mock database session
        mock_session = Mock()
        mock_session_local.return_value = mock_session

        # Create mock appointment objects
        mock_appointment1 = Mock(spec=ParsedAppointment)
        mock_appointment1.id = "550e8400-e29b-41d4-a716-446655440000"
        mock_appointment1.original_filename = "test1.pdf"
        mock_appointment1.name = "Dermatology Consultation"
        mock_appointment1.date = date(2025, 1, 15)
        mock_appointment1.appointment_type = "Specialist"
        mock_appointment1.summary = "Patient presented with skin lesions"
        mock_appointment1.doctor = "Dr. Smith"
        mock_appointment1.file_size = 1024
        mock_appointment1.processing_status = "completed"
        mock_appointment1.confidence_score = 85
        mock_appointment1.created_at = datetime(2025, 1, 15, 10, 0, 0)
        mock_appointment1.updated_at = datetime(2025, 1, 15, 10, 0, 0)

        mock_appointment2 = Mock(spec=ParsedAppointment)
        mock_appointment2.id = "550e8400-e29b-41d4-a716-446655440001"
        mock_appointment2.original_filename = "test2.pdf"
        mock_appointment2.name = "Cardiology Checkup"
        mock_appointment2.date = date(2025, 2, 20)
        mock_appointment2.appointment_type = "General Checkup"
        mock_appointment2.summary = "Routine checkup completed"
        mock_appointment2.doctor = "Dr. Johnson"
        mock_appointment2.file_size = 2048
        mock_appointment2.processing_status = "completed"
        mock_appointment2.confidence_score = 92
        mock_appointment2.created_at = datetime(2025, 2, 20, 11, 0, 0)
        mock_appointment2.updated_at = datetime(2025, 2, 20, 11, 0, 0)

        # Mock the query results
        mock_session.query.return_value.all.return_value = [mock_appointment1, mock_appointment2]

        response = client.get("/parsed-appointments")

        assert response.status_code == 200
        data = response.json()

        # Should return a list with 2 appointments
        assert isinstance(data, list)
        assert len(data) == 2

        # Check first appointment
        assert data[0]["id"] == "550e8400-e29b-41d4-a716-446655440000"
        assert data[0]["original_filename"] == "test1.pdf"
        assert data[0]["name"] == "Dermatology Consultation"
        assert data[0]["date"] == "2025-01-15"
        assert data[0]["appointment_type"] == "Specialist"
        assert data[0]["summary"] == "Patient presented with skin lesions"
        assert data[0]["doctor"] == "Dr. Smith"
        assert data[0]["file_size"] == 1024
        assert data[0]["processing_status"] == "completed"
        assert data[0]["confidence_score"] == 85
        assert "created_at" in data[0]
        assert "updated_at" in data[0]

        # Check second appointment
        assert data[1]["id"] == "550e8400-e29b-41d4-a716-446655440001"
        assert data[1]["name"] == "Cardiology Checkup"
        assert data[1]["appointment_type"] == "General Checkup"

        # Verify database session was closed
        mock_session.close.assert_called_once()

    @patch("controllers.appointments.SessionLocal")
    def test_get_parsed_appointments_empty(self, mock_session_local):
        """Test getting parsed appointments when no data exists"""
        # Mock database session
        mock_session = Mock()
        mock_session_local.return_value = mock_session

        # Mock empty query results
        mock_session.query.return_value.all.return_value = []

        response = client.get("/parsed-appointments")

        assert response.status_code == 200
        data = response.json()

        # Should return an empty list
        assert isinstance(data, list)
        assert len(data) == 0

        # Verify database session was closed
        mock_session.close.assert_called_once()

    @patch("controllers.appointments.SessionLocal")
    def test_get_parsed_appointments_database_error(self, mock_session_local):
        """Test getting parsed appointments when database error occurs"""
        # Mock database session to raise an exception
        mock_session = Mock()
        mock_session_local.return_value = mock_session
        mock_session.query.side_effect = Exception("Database connection failed")

        response = client.get("/parsed-appointments")

        assert response.status_code == 500
        assert "Database connection failed" in response.json()["detail"]

        # Verify database session was still closed even with error
        mock_session.close.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
