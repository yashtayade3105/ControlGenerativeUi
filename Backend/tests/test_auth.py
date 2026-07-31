import unittest
import os
import sys
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient

# Ensure backend root is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.db.session import get_db

# Override get_db to return a mock session
async def override_get_db():
    db = AsyncMock()
    # Mock database execute calls to return dummy query results
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    db.execute.return_value = mock_result
    yield db

class TestAuthRoutes(unittest.TestCase):
    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)
        os.environ["ENV"] = "development"

    def tearDown(self):
        app.dependency_overrides.clear()
        os.environ["ENV"] = "production"

    @patch("app.routers.auth.send_otp_email", new_callable=AsyncMock)
    def test_signup_otp_request_dev(self, mock_send_email):
        # In dev, SMTP failure (returning False) yields debug_otp
        mock_send_email.return_value = False
        response = self.client.post("/auth/signup/request-otp", json={"email": "newuser@example.com"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("debug_otp", data, "debug_otp must be returned in development mode when email fails.")

    @patch("app.routers.auth.send_otp_email", new_callable=AsyncMock)
    def test_signup_otp_request_prod(self, mock_send_email):
        # In prod, SMTP failure must raise 500 error instead of leaking debug_otp
        os.environ["ENV"] = "production"
        mock_send_email.return_value = False
        response = self.client.post("/auth/signup/request-otp", json={"email": "newproduser@example.com"})
        self.assertEqual(response.status_code, 500)
        self.assertNotIn("debug_otp", response.json())

    def test_master_otp_bypass_dev(self):
        # Verify master bypass OTP works in dev mode
        response = self.client.post("/auth/signup/verify-otp", json={"email": "bypass_user@example.com", "otp_code": "123456"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("bypass verified", response.json()["message"].lower())

    def test_master_otp_bypass_prod(self):
        # Verify master bypass OTP fails in prod mode
        os.environ["ENV"] = "production"
        response = self.client.post("/auth/signup/verify-otp", json={"email": "bypass_user@example.com", "otp_code": "123456"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("invalid or expired", response.json()["detail"].lower())

if __name__ == "__main__":
    unittest.main()
