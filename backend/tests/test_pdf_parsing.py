import pytest
import json
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
from fastapi import UploadFile
import io

from main import app

client = TestClient(app)

# Mock PDF content for testing - simplified version
MOCK_PDF_CONTENT = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Mock PDF Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000200 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n284\n%%EOF"

# Test data for different scenarios
HIGH_CONFIDENCE_COMPLETE_DATA = {
    "name": "Dermatology Consultation",
    "date": "2025-01-15",
    "appointment_type": "Specialist",
    "summary": "Patient presented with skin lesions. Diagnosis: benign nevus. Recommended follow-up in 6 months.",
    "doctor": "Dr. Smith",
    "confidence_score": 85
}

HIGH_CONFIDENCE_MISSING_TYPE_DATA = {
    "name": "Cardiology Consultation",
    "date": "2025-02-20",
    "appointment_type": "",  # Missing type
    "summary": "Patient evaluated for chest pain. ECG normal. Recommended lifestyle modifications.",
    "doctor": "Dr. Johnson",
    "confidence_score": 78
}

LOW_CONFIDENCE_DATA = {
    "name": "Medical Report",
    "date": "2025-03-10",
    "appointment_type": "General Checkup",
    "summary": "Routine examination completed.",
    "doctor": "Unknown",
    "confidence_score": 35  # Below threshold
}

MISSING_FIELDS_DATA = {
    "name": "",  # Missing name
    "date": "",  # Missing date
    "appointment_type": "Lab Work",
    "summary": "",  # Missing summary
    "doctor": "",  # Missing doctor
    "confidence_score": 75
}

class TestPDFParser:

    @patch('controllers.appointments.SessionLocal')
    @patch('controllers.appointments.client.chat.completions.create')
    @patch('controllers.appointments.PyPDF2.PdfReader')
    def test_high_confidence_complete_data(self, mock_pdf_reader, mock_chatgpt, mock_session_local):
        """Test parsing with high confidence and complete data"""
        # Mock the PDF reader
        mock_page = Mock()
        mock_page.extract_text.return_value = "Mock PDF content for testing"
        mock_pdf_reader.return_value.pages = [mock_page]

        # Mock the OpenAI response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = json.dumps(HIGH_CONFIDENCE_COMPLETE_DATA)
        mock_chatgpt.return_value = mock_response

        # Mock database session
        mock_session = Mock()
        mock_session_local.return_value = mock_session

        # Create a mock appointment that will be passed to add()
        mock_appointment_instance = Mock()
        mock_appointment_instance.id = "test-id-123"

        # Mock the session methods
        def mock_refresh(obj):
            obj.id = "test-id-123"

        mock_session.add.return_value = None
        mock_session.commit.return_value = None
        mock_session.refresh.side_effect = mock_refresh

        # Create test file
        pdf_file = io.BytesIO(b"mock pdf content")
        files = {"file": ("test.pdf", pdf_file, "application/pdf")}

        response = client.post("/parse-pdf", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Dermatology Consultation"
        assert data["appointment_type"] == "Specialist"
        assert data["confidence_score"] == 85
        assert "file_size" in data
        assert data["id"] == "test-id-123"

    @patch('controllers.appointments.SessionLocal')
    @patch('controllers.appointments.client.chat.completions.create')
    @patch('controllers.appointments.PyPDF2.PdfReader')
    def test_high_confidence_missing_appointment_type(self, mock_pdf_reader, mock_chatgpt, mock_session_local):
        """Test parsing with high confidence but missing appointment type - should set to 'Other'"""
        # Mock the PDF reader
        mock_page = Mock()
        mock_page.extract_text.return_value = "Mock PDF content for testing"
        mock_pdf_reader.return_value.pages = [mock_page]

        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = json.dumps(HIGH_CONFIDENCE_MISSING_TYPE_DATA)
        mock_chatgpt.return_value = mock_response

        # Mock database session
        mock_session = Mock()
        mock_session_local.return_value = mock_session
        mock_appointment = Mock()
        mock_appointment.id = "test-id-456"
        mock_session.add.return_value = None
        mock_session.commit.return_value = None
        mock_session.refresh.return_value = None

        pdf_file = io.BytesIO(b"mock pdf content")
        files = {"file": ("test.pdf", pdf_file, "application/pdf")}

        response = client.post("/parse-pdf", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Cardiology Consultation"
        assert data["appointment_type"] == "Other"  # Should be set to 'Other'
        assert data["confidence_score"] == 78

    @patch('controllers.appointments.client.chat.completions.create')
    @patch('controllers.appointments.PyPDF2.PdfReader')
    def test_low_confidence_data(self, mock_pdf_reader, mock_chatgpt):
        """Test parsing with low confidence score - should return 400 error"""
        # Mock the PDF reader
        mock_page = Mock()
        mock_page.extract_text.return_value = "Mock PDF content for testing"
        mock_pdf_reader.return_value.pages = [mock_page]

        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = json.dumps(LOW_CONFIDENCE_DATA)
        mock_chatgpt.return_value = mock_response

        pdf_file = io.BytesIO(b"mock pdf content")
        files = {"file": ("test.pdf", pdf_file, "application/pdf")}

        response = client.post("/parse-pdf", files=files)

        assert response.status_code == 400
        assert "Low confidence score" in response.json()["detail"]

    @patch('controllers.appointments.client.chat.completions.create')
    @patch('controllers.appointments.PyPDF2.PdfReader')
    def test_missing_required_fields(self, mock_pdf_reader, mock_chatgpt):
        """Test parsing with missing required fields - should return 400 error"""
        # Mock the PDF reader
        mock_page = Mock()
        mock_page.extract_text.return_value = "Mock PDF content for testing"
        mock_pdf_reader.return_value.pages = [mock_page]

        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = json.dumps(MISSING_FIELDS_DATA)
        mock_chatgpt.return_value = mock_response

        pdf_file = io.BytesIO(b"mock pdf content")
        files = {"file": ("test.pdf", pdf_file, "application/pdf")}

        response = client.post("/parse-pdf", files=files)

        assert response.status_code == 400
        assert "Missing required fields" in response.json()["detail"]

    @patch('controllers.appointments.client.chat.completions.create')
    @patch('controllers.appointments.PyPDF2.PdfReader')
    def test_invalid_json_response(self, mock_pdf_reader, mock_chatgpt):
        """Test parsing when ChatGPT returns invalid JSON - should return 400 error"""
        # Mock the PDF reader
        mock_page = Mock()
        mock_page.extract_text.return_value = "Mock PDF content for testing"
        mock_pdf_reader.return_value.pages = [mock_page]

        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "This is not valid JSON"
        mock_chatgpt.return_value = mock_response

        pdf_file = io.BytesIO(b"mock pdf content")
        files = {"file": ("test.pdf", pdf_file, "application/pdf")}

        response = client.post("/parse-pdf", files=files)

        assert response.status_code == 400
        assert "Failed to parse JSON response" in response.json()["detail"]

    def test_invalid_file_type(self):
        """Test uploading non-PDF file - should return 400 error"""
        files = {"file": ("test.txt", io.BytesIO(b"not a pdf"), "text/plain")}

        response = client.post("/parse-pdf", files=files)

        assert response.status_code == 400
        assert "File must be a PDF" in response.json()["detail"]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
