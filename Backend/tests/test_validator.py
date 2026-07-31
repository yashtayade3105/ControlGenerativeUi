import unittest
from app.services.validator import try_repair_json, clean_dict_values, validate_and_repair_json

class TestValidator(unittest.TestCase):
    def test_try_repair_json_truncated(self):
        # Unclosed JSON string and braces
        broken_json = '{"version": "1.0", "components": [{"type": "Callout", "props": {"text": "Hello'
        repaired = try_repair_json(broken_json)
        self.assertIn('"Hello"', repaired)
        self.assertTrue(repaired.endswith('}]}') or repaired.endswith('}}]}'))

    def test_try_repair_json_think_block(self):
        # DeepSeek style think blocks removal
        json_with_think = '<think>some reasoning</think>{"version": "1.0", "intent": "greet"}'
        repaired = try_repair_json(json_with_think)
        self.assertNotIn("<think>", repaired)
        self.assertNotIn("reasoning", repaired)
        self.assertTrue(repaired.startswith("{"))

    def test_clean_dict_values_numeric(self):
        # Test that numeric null keys are omitted
        data = {
            "rating": None,
            "cutoff": "NaN",
            "year": "undefined",
            "name": None  # non-numeric should get "Unknown"
        }
        cleaned = clean_dict_values(data)
        self.assertNotIn("rating", cleaned)
        self.assertNotIn("cutoff", cleaned)
        self.assertNotIn("year", cleaned)
        self.assertEqual(cleaned.get("name"), "Unknown")

    def test_validate_and_repair_json_invalid_component(self):
        # Test unrecognized component fallback mapping and original type capture
        invalid_spec = '{"intent": "search", "confidence": 0.9, "components": [{"type": "UnknownWidget", "props": {"fancy": true}}], "sources": []}'
        validated = validate_and_repair_json(invalid_spec)
        
        comp = validated["components"][0]
        self.assertEqual(comp["type"], "Callout")
        self.assertEqual(comp["props"]["tone"], "warn")
        self.assertIn("UnknownWidget", comp["props"]["text"])

if __name__ == "__main__":
    unittest.main()
