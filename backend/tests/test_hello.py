import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

class TestHello:

    def test_hello_endpoint(self):
        """Test the hello endpoint returns expected message"""
        response = client.get("/hello")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "world"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
