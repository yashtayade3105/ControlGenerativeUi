import unittest
from unittest.mock import AsyncMock, MagicMock
from app.services.chatbot import query_sgbau_knowledge_base, get_llm_chat_response
from app.config import settings

class TestGrounding(unittest.IsolatedAsyncioTestCase):
    async def test_non_existent_college_refusal(self):
        db = AsyncMock()
        
        # Mock database returning no matching colleges
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db.execute.return_value = mock_result
        
        facts = await query_sgbau_knowledge_base("Find cutoffs for Oxford University computer science.", db)
        self.assertEqual(facts, "", "Grounding failed: Oxford University should not match any SGBAU college facts.")

    async def test_abbreviation_matching(self):
        db = AsyncMock()
        
        # Mock matched college
        mock_college = MagicMock()
        mock_college.college_name = "Government College of Engineering, Amravati"
        mock_college.college_code = 1002
        mock_college.location = "Amravati"
        mock_college.college_type = "Government Autonomous"
        mock_college.website_link = "https://gcoea.ac.in"
        
        mock_result_college = MagicMock()
        mock_result_college.scalars.return_value.all.return_value = [mock_college]
        
        mock_result_cutoff = MagicMock()
        mock_result_cutoff.scalars.return_value.all.return_value = []
        
        # Set database mock execution side-effect
        db.execute.side_effect = [mock_result_college, mock_result_cutoff]
        
        facts = await query_sgbau_knowledge_base("Is there a good branch in GCOEA?", db)
        self.assertIn("Government College of Engineering, Amravati", facts, "GCOEA abbreviation mapping failed.")

    async def test_true_llm_refusal_on_empty_facts(self):
        # This test ensures the LLM obeys the grounding prompt when facts are empty
        if not settings.OPENAI_API_KEY:
            self.skipTest("No OPENAI_API_KEY found, skipping true LLM refusal test.")
            
        messages = [{"role": "user", "content": "What is the fee for Oxford University?"}]
        empty_facts = ""
        
        # We call the actual LLM engine with the grounding prompt but NO facts
        response_json_str = await get_llm_chat_response(messages, empty_facts)
        
        import json
        response = json.loads(response_json_str)
        
        # The prompt should force it to return a Callout with tone warn/danger
        components = response.get("components", [])
        self.assertGreater(len(components), 0, "Model returned no components.")
        
        callout = components[0]
        self.assertEqual(callout.get("type"), "Callout", "Model did not return a Callout for missing data.")
        self.assertIn(callout.get("props", {}).get("tone"), ["warn", "danger"], "Refusal callout must have warn or danger tone.")

if __name__ == "__main__":
    unittest.main()
