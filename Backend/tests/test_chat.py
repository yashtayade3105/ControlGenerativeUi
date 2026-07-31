import unittest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend root is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

class TestChatRoutes(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_online_status(self):
        # Verify FastAPI service is online
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "online")

    def test_chat_session_auth_protection(self):
        # Accessing chat routes without auth should return 401
        response = self.client.get("/chats")
        self.assertEqual(response.status_code, 401)

if __name__ == "__main__":
    unittest.main()
