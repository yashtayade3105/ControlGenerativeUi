import unittest
import os
import sys
from fastapi.testclient import TestClient
from unittest.mock import patch
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

    @patch("app.services.chatbot.get_llm_chat_stream_response")
    @patch("app.db.session.AsyncSessionLocal")
    def test_streaming_endpoint_cleans_bad_response(self, mock_async_session_local, mock_llm_stream):
        import uuid
        import json
        from app.db.models import User, ChatSession
        from app.routers.chat import get_current_user
        from app.db.session import get_db

        # Mock current user
        fake_user = User(id=uuid.uuid4(), email="test@example.com")
        
        async def override_get_current_user():
            return fake_user
        
        app.dependency_overrides[get_current_user] = override_get_current_user

        # Mock db session execute for session lookup
        from unittest.mock import AsyncMock, MagicMock
        
        async def override_get_db():
            db = AsyncMock()
            mock_sess_result = MagicMock()
            fake_session = ChatSession(id=uuid.uuid4(), user_id=fake_user.id)
            mock_sess_result.scalars.return_value.first.return_value = fake_session
            db.execute.return_value = mock_sess_result
            yield db

        from app.db.session import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Mock background session for saving
        mock_bg_db = AsyncMock()
        mock_async_session_local.return_value.__aenter__.return_value = mock_bg_db

        # Mock LLM stream returning a badly formatted/unknown component
        async def fake_stream(*args, **kwargs):
            yield '{"type": "FakeComponentMissingPropsAndId"}\n'
            yield '{"this_is": "total_garbage"}\n'
        
        mock_llm_stream.side_effect = fake_stream

        response = self.client.post(f"/chats/{uuid.uuid4()}/send", json={"content": "test"})
        
        # Exhaust stream
        content = response.content
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "application/x-ndjson")

        # Verify that the background task saved a cleaned response
        mock_bg_db.add.assert_called_once()
        saved_message = mock_bg_db.add.call_args[0][0]
        
        saved_content = json.loads(saved_message.content)
        
        # Assert contract was applied
        self.assertIn("version", saved_content)
        self.assertIn("components", saved_content)
        
        # Ensure fake component got an ID
        self.assertTrue(any("id" in c for c in saved_content["components"]))

        app.dependency_overrides.clear()

if __name__ == "__main__":
    unittest.main()
