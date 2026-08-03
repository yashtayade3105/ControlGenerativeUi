import pytest
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.chatbot import get_llm_chat_stream_response
from app.services.validator import validate_and_repair_json

pytestmark = pytest.mark.anyio

# This eval suite will call the actual LLM to test the prompt's adherence to the contract.
# It requires OPENAI_API_KEY to be set in the environment or .env.

async def generate_and_validate(query: str, db_facts: str) -> dict:
    messages = [{"role": "user", "content": query}]
    stream = get_llm_chat_stream_response(messages, db_facts)
    
    full_output = ""
    async for chunk in stream:
        full_output += chunk
        
    parsed_components = []
    for line in full_output.split('\n'):
        line = line.strip()
        if line:
            try:
                parsed_components.append(json.loads(line))
            except Exception:
                pass
                
    raw_spec = json.dumps({"components": parsed_components})
    return validate_and_repair_json(raw_spec)

# ==========================================
# EVAL: Domain Refusal (Zero-Trust Policy)
# ==========================================
@pytest.mark.parametrize("query", [
    "Who won the cricket world cup in 2023?",
    "Write a poem about the ocean.",
    "What are the best engineering colleges in Pune University?",
    "Tell me the recipe for butter chicken.",
    "How to learn Python in 30 days?"
])
async def test_eval_domain_refusal(query):
    # Empty DB facts because they don't relate to SGBAU
    spec = await generate_and_validate(query, "")
    components = spec.get("components", [])
    
    assert len(components) > 0, "Model should return at least one component."
    
    # Must use Callout with danger tone for domain refusal
    has_danger_callout = any(
        c.get("type") == "Callout" and c.get("props", {}).get("tone") == "danger"
        for c in components
    )
    assert has_danger_callout, f"Domain refusal failed for query: {query}. Output: {spec}"

# ==========================================
# EVAL: Grounding Refusal (No Hallucination)
# ==========================================
@pytest.mark.parametrize("query", [
    "What is the exact placement package for GCOEA computer science in 2024?",
    "Who is the current principal of Sipna college?",
    "Tell me the hostel fees for PRMITR.",
    "What are the mess charges for SSGMCE?",
    "Give me the admission helpline number for COETA Akola."
])
async def test_eval_grounding_refusal(query):
    # We provide empty DB facts, so the model MUST NOT hallucinate answers it doesn't have in facts.
    spec = await generate_and_validate(query, "")
    components = spec.get("components", [])
    
    assert len(components) > 0, "Model should return at least one component."
    
    # Must use Callout with warn or danger tone for grounding refusal
    has_refusal_callout = any(
        c.get("type") == "Callout" and c.get("props", {}).get("tone") in ["warn", "danger"]
        for c in components
    )
    assert has_refusal_callout, f"Grounding refusal failed for query: {query}. Output: {spec}"

# ==========================================
# EVAL: Component Choice (Intent Matching)
# ==========================================
@pytest.mark.parametrize("query, mock_facts, expected_component", [
    (
        "Hi, I want to take admission in SGBAU.",
        "",
        "BranchForm"
    ),
    (
        "What are the cutoffs for GCOEA?",
        "--- MATCHED DATABASE FACTS ---\nCollege Name: Government College of Engineering Amravati\nCutoffs Data:\n- Branch: CSE, Cutoff: 98%",
        "CutoffTable"
    ),
    (
        "Can you show me the location of Sipna college?",
        "--- MATCHED DATABASE FACTS ---\nCollege Name: Sipna College of Engineering\nLocation: Amravati",
        "LocationMap"
    ),
    (
        "What is the fee structure for PRMITR?",
        "--- MATCHED DATABASE FACTS ---\nCollege Name: PRMITR\nFees: Open 1 Lakh, OBC 50k",
        "FeeStructure"
    ),
    (
        "Tell me about placements at SSGMCE.",
        "--- MATCHED DATABASE FACTS ---\nCollege Name: SSGMCE\nPlacements: TCS, Infosys, Highest Package: 10 LPA",
        "PlacementStats"
    ),
    (
        "What documents do I need for admission?",
        "",
        "DocumentsRequired"
    ),
    (
        "What is the admission timeline for CAP rounds?",
        "",
        "AdmissionTimeline"
    ),
    (
        "Are there any scholarships available?",
        "",
        "ScholarshipCard"
    ),
    (
        "Show me user reviews for GCOEA.",
        "--- MATCHED DATABASE FACTS ---\nCollege Name: GCOEA\n",
        "UserReview"
    ),
    (
        "Tell me the contact details for admission office.",
        "",
        "ContactCard"
    )
])
async def test_eval_component_choice(query, mock_facts, expected_component):
    spec = await generate_and_validate(query, mock_facts)
    components = spec.get("components", [])
    
    assert len(components) > 0, "Model should return at least one component."
    
    # Check if the expected component was chosen by the model
    component_types = [c.get("type") for c in components]
    assert expected_component in component_types, f"Expected {expected_component} for query '{query}', but got {component_types}"
