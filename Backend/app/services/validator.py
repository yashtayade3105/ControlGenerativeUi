import json
import re
from typing import Dict, Any, Optional
from app.schemas.genui import GenUIResponse

def try_repair_json(json_str: str) -> str:
    """
    Attempt to repair common LLM json output defects, including truncation.
    """
    cleaned = json_str.strip()
    # Strip any deepseek think blocks
    cleaned = re.sub(r"<think>[\s\S]*?<\/think>", "", cleaned, flags=re.IGNORECASE).strip()
    
    # Strip markdown code blocks
    cleaned = re.sub(r"^```json\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    
    # Locate start of JSON
    first_brace = cleaned.find('{')
    if first_brace != -1:
        cleaned = cleaned[first_brace:]

    # Remove incomplete trailing characters after the last valid json structure indicator
    # e.g., trailing comma or colon that was truncated
    cleaned = re.sub(r',\s*$', '', cleaned)
    cleaned = re.sub(r':\s*$', '', cleaned)

    # Balance unclosed double-quotes
    # Count unescaped double quotes
    quotes_count = cleaned.count('"')
    escaped_quotes_count = cleaned.count('\\"')
    actual_quotes = quotes_count - escaped_quotes_count
    if actual_quotes % 2 != 0:
        cleaned += '"'

    # Balance unclosed brackets and braces
    stack = []
    in_string = False
    escaped = False
    
    for char in cleaned:
        if escaped:
            escaped = False
            continue
        if char == '\\':
            escaped = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if not in_string:
            if char == '{':
                stack.append('}')
            elif char == '[':
                stack.append(']')
            elif char == '}':
                if stack and stack[-1] == '}':
                    stack.pop()
            elif char == ']':
                if stack and stack[-1] == ']':
                    stack.pop()

    # Append closing brackets/braces in reverse order
    while stack:
        cleaned += stack.pop()
        
    return cleaned

def clean_dict_values(data: Any) -> Any:
    """
    Recursively remove null, undefined, NaN, and replace with "Unknown" or omit.
    """
    if isinstance(data, dict):
        cleaned = {}
        numeric_keys = {"rating", "cutoff", "year", "round", "cutoff_percentile", "cap_round", "code", "college_code"}
        for k, v in data.items():
            if v is None or v == "undefined" or str(v) == "NaN":
                if k in numeric_keys:
                    continue  # drop key to avoid breaking type validation
                cleaned[k] = "Unknown"
            else:
                cleaned[k] = clean_dict_values(v)
        return cleaned
    elif isinstance(data, list):
        return [clean_dict_values(item) for item in data]
    return data


def validate_and_repair_json(json_str: str) -> Dict[str, Any]:
    """
    Parse, repair, clean, and validate GenUI Response JSON against canonical contract.
    """
    repaired_str = try_repair_json(json_str)
    
    try:
        data = json.loads(repaired_str)
    except json.JSONDecodeError as e:
        # Fallback regex helper for partial stream parsing or extreme errors
        try:
            # Let's count open/close braces and append matching closures
            open_braces = repaired_str.count('{')
            close_braces = repaired_str.count('}')
            if open_braces > close_braces:
                repaired_str += '}' * (open_braces - close_braces)
            data = json.loads(repaired_str)
        except Exception:
            raise ValueError(f"Failed to parse invalid JSON. Error: {e}")

    # Recursively clean nulls
    data = clean_dict_values(data)

    # If missing required contract fields, default them
    if "version" not in data:
        data["version"] = "1.0"
    if "intent" not in data:
        data["intent"] = "general_inquiry"
    if "confidence" not in data:
        data["confidence"] = 0.90
    if "components" not in data or not isinstance(data["components"], list):
        data["components"] = []
    if "sources" not in data or not isinstance(data["sources"], list):
        data["sources"] = [{"type": "database", "name": "college_master"}]

    # Ensure id mapping rules are fulfilled before Pydantic validation
    for idx, comp in enumerate(data["components"]):
        if not isinstance(comp, dict):
            continue
        if "id" not in comp or not comp["id"]:
            comp["id"] = f"cmp_{idx+1:03d}"
        if "props" not in comp:
            comp["props"] = {}

    # Validate against schema
    response_model = GenUIResponse(**data)
    
    # Return serializable dict matching schema
    return response_model.model_dump()

