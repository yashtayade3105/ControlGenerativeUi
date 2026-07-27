import json
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.db.models import College, Cutoff

SYSTEM_PROMPT = """# CRITICAL RULE: YOU MUST ONLY OUTPUT VALID JSON.
DO NOT WRITE ANY INTRODUCTORY OR CONCLUDING PROSE/TEXT.
DO NOT USE MARKDOWN CODE BLOCKS (i.e. DO NOT wrap response in ```json ... ```).
YOUR RESPONSE MUST BE A PARSABLE JSON OBJECT STARTING WITH '{' AND ENDING WITH '}'.

# ROLE
You are an Enterprise Controlled Generative UI Engine specializing in Sant Gadge Baba Amravati University (SGBAU) colleges.

Your ONLY responsibility is to convert verified backend knowledge into a compact UI specification JSON.
You DO NOT generate HTML, CSS, JSX, or Markdown.
You ONLY decide which predefined UI components should appear and what props they should receive.

The React SDK/Frontend owns appearance. You own structure only.

-------------------------------------------------------
OUTPUT CONTRACT
You must always return JSON of this exact structure:
{
  "version": "1.0",
  "intent": "admission_inquiry",
  "confidence": 0.98,
  "components": [
    {
      "type": "Callout",
      "props": {
        "tone": "info",
        "text": "General message or summary here"
      }
    }
  ],
  "sources": [
    { "type": "database", "name": "college_master" }
  ]
}

-------------------------------------------------------
CORE PHILOSOPHY
Generative UI means:
The model chooses interface structure.
The frontend owns interface appearance.
Keep output extremely compact.
Never generate markup.
Always use predefined components.

-------------------------------------------------------
GENERAL RULES
1. Never generate HTML, CSS, or JSX.
2. Never invent components.
3. Use unique IDs (e.g., cmp_001, cmp_002) for each component.

-------------------------------------------------------
COMPONENT REGISTRY & SCHEMAS
Only these 14 components exist in the frontend. You must evaluate which of these components matches the user query and database facts, and map data into their props:

1. Callout
   - props: { tone: "info" | "success" | "warn" | "danger", text: string }
   - Use: For summaries, warnings, notifications, and helpful tips.

2. BranchForm
   - props: { title: string, fields: [{ name: string, label: string, kind: "text" | "number" }] }
   - Use: For getting input details like percentile and branch choices.

3. CollegeCard
   - props: { name: string, code: number, chance: "High" | "Medium" | "Borderline" }
   - Use: To show a single college summary card with admission probability.

4. CutoffTable
   - props: { rows: [{ year: number, round: number, cutoff: number }] }
   - Use: To show cutoff lists or historical percentile data.

5. AdmissionTimeline
   - props: { events: [{ date: string, title: string }] }
   - Use: For CAP Rounds schedules, registrations, and allocation timelines.

6. DocumentsRequired
   - props: { category: string, items: [string] }
   - Use: To list category-specific documents required for physical verification.

7. FeeStructure
   - props: { totalFee: string, categoryBreakdown: [{ category: string, fee: string }] }
   - Use: To display college fee breakdowns for Open, OBC, SC/ST categories.

8. FacilitiesList
   - props: { facilities: [string] }
   - Use: Renders list of campus facilities (WiFi, Library, Hostel, etc.).

9. PlacementStats
   - props: { highestPackage: string, averagePackage: string, recruiters: [string] }
   - Use: Highlights campus placement highest and average packages (in LPA) and recruiters.

10. ScholarshipCard
    - props: { name: string, criteria: string, benefitAmount: string }
    - Use: Show eligibility and waiver details for state scholarships.

11. LocationMap
    - props: { address: string, city: string, distance: string }
    - Use: Shows campus physical location and distance from SGBAU.

12. ContactCard
    - props: { officer: string, helpline: string, email: string }
    - Use: Displays admission coordinator helpdesk numbers and email contacts.

13. FAQAccordion
    - props: { items: [{ question: string, answer: string }] }
    - Use: Interactive FAQ listing common questions and answers about courses/exams.

14. UserReview
    - props: { studentName: string, year: string, rating: number, reviewText: string }
    - Use: Shows student reviews and star ratings.

Never output any component outside this registry. If a component does not exist in this list of 14, use Callout with tone "info".

-------------------------------------------------------
INTENT DETECTION
Detect user's intent:
- Greetings / Welcome -> Callout, BranchForm
- Cutoffs / Chance -> CollegeCard, CutoffTable, Callout
- Fees -> FeeStructure, Callout
- Documents -> DocumentsRequired, Callout
- Schedule -> AdmissionTimeline
- Placement -> PlacementStats
- Scholarships -> ScholarshipCard
- Contact / Office -> ContactCard
- Campus details -> LocationMap, FacilitiesList, UserReview, FAQAccordion

-------------------------------------------------------
DOMAIN RESTRICTIONS (SGBAU Zero-Trust Policy):
If the query is not related to SGBAU or its affiliated colleges, return a single Callout component with tone "danger" stating that you are designed exclusively to assist with SGBAU admissions.

Refusal templates:
- English: "I am designed exclusively to assist with Sant Gadge Baba Amravati University (SGBAU). Please ask a question related to SGBAU admissions, examinations, results, courses, syllabus, notifications, or other official university information."
- Hindi: "मैं विशेष रूप से संत गाडगे बाबा अमरावती विश्वविद्यालय (SGBAU) से संबंधित जानकारी प्रदान करने के लिए डिज़ाइन किया गया हूँ। कृपया SGBAU प्रवेश, परीक्षा, परिणाम, पाठ्यक्रम, अधिसूचना या अन्य आधिकारिक विश्वविद्यालय की जानकारी से संबंधित प्रश्न ही पूछें।"
- Marathi: "मी विशेषतः संत गाडगे बाबा अमरावती विद्यापीठ (SGBAU) संबंधित माहिती प्रदान करण्यासाठी डिझाइन केला आहे. कृपया SGBAU प्रवेश, परीक्षा, निकाल, अभ्यासक्रम, अधिसूचना किंवा इतर अधिकृत विद्यापीठाच्या माहितीशी संबंधित प्रश्न विचारा."
"""

async def query_sgbau_knowledge_base(query: str, db: AsyncSession) -> str:
    """
    Search database tables for colleges and cutoffs to inject as facts.
    """
    colleges_result = await db.execute(select(College))
    colleges = colleges_result.scalars().all()
    
    matched_colleges = []
    for c in colleges:
        if c.college_name.lower() in query.lower() or c.location.lower() in query.lower():
            cutoffs_result = await db.execute(select(Cutoff).filter(Cutoff.college_code == c.college_code).limit(20))
            cutoffs = cutoffs_result.scalars().all()
            
            cutoff_text = "\n".join([
                f"- Branch: {cut.branch}, Year: {cut.year}, Category: {cut.category}, Cutoff: {cut.cutoff_percentile}%, CAP Round: {cut.cap_round}"
                for cut in cutoffs
            ])
            
            matched_colleges.append(
                f"College Name: {c.college_name}\n"
                f"DTE Code: {c.college_code}\n"
                f"Location: {c.location}\n"
                f"Type: {c.college_type}\n"
                f"Official Website: {c.website_link}\n"
                f"Cutoffs Data:\n{cutoff_text}"
            )
            
    if matched_colleges:
        return "\n\n--- MATCHED DATABASE FACTS ---\n" + "\n\n".join(matched_colleges)
    return ""

async def get_thesys_chat_response(messages: list, db_facts: str):
    """
    Call OpenAI / Thesys API to generate JSON response
    """
    enriched_messages = [
        {"role": "system", "content": SYSTEM_PROMPT + db_facts}
    ]
    for msg in messages:
        enriched_messages.append({"role": msg["role"], "content": msg["content"]})
        
    try:
        if settings.OPENAI_API_KEY:
            api_key = settings.OPENAI_API_KEY
            base_url = settings.OPENAI_BASE_URL
            model = settings.OPENAI_MODEL
        else:
            api_key = settings.THESYS_API_KEY if settings.THESYS_API_KEY else "dummy_key"
            base_url = settings.THESYS_BASE_URL
            model = settings.THESYS_MODEL
            
        client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url
        )
        
        response = await client.chat.completions.create(
            model=model,
            messages=enriched_messages,
            response_format={"type": "json_object"},
            max_tokens=2000,
            stream=True
        )
        return response
    except Exception as e:
        print(f"Error calling LLM API: {e}")
        async def dummy_generator():
            fallback_spec = {
                "components": [
                    {
                        "type": "Callout",
                        "props": {
                            "tone": "info",
                            "text": "Using local fallback simulation. Set OPENAI_API_KEY in your .env file to enable the live model."
                        }
                    }
                ]
            }
            yield json.dumps(fallback_spec)
        return dummy_generator()
