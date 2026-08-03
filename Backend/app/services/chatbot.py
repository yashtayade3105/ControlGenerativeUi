import json
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.db.models import College, Cutoff

SYSTEM_PROMPT = """# CRITICAL RULE: YOU MUST ONLY OUTPUT VALID NEWLINE-DELIMITED JSON (JSONL).
DO NOT WRITE ANY INTRODUCTORY OR CONCLUDING PROSE/TEXT.
DO NOT USE MARKDOWN CODE BLOCKS.
YOUR RESPONSE MUST BE A SEQUENCE OF JSON OBJECTS, ONE PER LINE.

# ROLE
You are an Enterprise Controlled Generative UI Engine specializing in Sant Gadge Baba Amravati University (SGBAU) colleges.

Your ONLY responsibility is to convert verified backend knowledge into a compact UI specification.
You DO NOT generate HTML, CSS, JSX, or Markdown.
You ONLY decide which predefined UI components should appear and what props they should receive.

The React SDK/Frontend owns appearance. You own structure only.

-------------------------------------------------------
OUTPUT CONTRACT
You must output a sequence of valid JSON objects, one per line (JSONL format). 
Each line must represent exactly one UI component.
Do not output a root array or a parent wrapper object.

Example output:
{"type": "Callout", "props": {"tone": "info", "text": "General message or summary here"}}
{"type": "CollegeCard", "props": {"name": "GCOEA", "code": 4004, "chance": "High"}}

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

-------------------------------------------------------
GROUNDING RULES (CRITICAL):
You MUST base your response ONLY on the provided "MATCHED DATABASE FACTS" section. 
- If the matched database facts are empty or do not contain information about the specific college/data requested by the user, you MUST NOT invent or fabricate any fees, cutoffs, ratings, placements, or details.
- Instead, you MUST output a single Callout component with tone "warn" or "danger" explaining that the requested college data or details are not available in our verified SGBAU database.
"""



COLLEGE_EMBEDDINGS_CACHE = {}  # {college_code: embedding_vector}

def cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = sum(a * a for a in vec1) ** 0.5
    norm2 = sum(b * b for b in vec2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)

async def get_embedding(text: str, client: AsyncOpenAI) -> list:
    response = await client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

async def query_sgbau_knowledge_base(query: str, db: AsyncSession) -> str:
    """
    Search database tables for colleges and cutoffs to inject as facts.
    Uses semantic retrieval (Cosine Similarity with OpenAI Embeddings) to match user intent.
    """
    import re
    global COLLEGE_EMBEDDINGS_CACHE

    if not settings.OPENAI_API_KEY:
        return ""

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL
    )

    # Fetch all colleges to build cache or retrieve matching ones
    colleges_result = await db.execute(select(College))
    all_colleges = colleges_result.scalars().all()
    
    if not all_colleges:
        return ""

    if not COLLEGE_EMBEDDINGS_CACHE:
        # Build embeddings for all colleges in a single batch
        texts = [f"{c.college_name} in {c.location} {c.college_type}" for c in all_colleges]
        try:
            response = await client.embeddings.create(
                input=texts,
                model="text-embedding-3-small"
            )
            for i, c in enumerate(all_colleges):
                COLLEGE_EMBEDDINGS_CACHE[c.college_code] = response.data[i].embedding
        except Exception as e:
            print(f"Failed to generate college embeddings: {e}")

    # Extract exact DTE codes if user provided any (4-digit integers, excluding common years)
    dte_codes = [int(x) for x in re.findall(r"\b\d{4}\b", query) if not (2010 <= int(x) <= 2030)]
    matched_college_codes = set(dte_codes)

    # Semantic search over embeddings
    if len(query.strip()) > 3 and COLLEGE_EMBEDDINGS_CACHE:
        try:
            query_emb = await get_embedding(query, client)
            for code, emb in COLLEGE_EMBEDDINGS_CACHE.items():
                if cosine_similarity(query_emb, emb) >= 0.45:
                    matched_college_codes.add(code)
        except Exception as e:
            print(f"Semantic search failed: {e}")

    if not matched_college_codes:
        return ""

    # Filter all_colleges to only the matched ones
    colleges = [c for c in all_colleges if c.college_code in matched_college_codes]
    
    matched_colleges = []
    for c in colleges:
        # Load up to 20 cutoff records
        cutoffs_result = await db.execute(
            select(Cutoff).filter(Cutoff.college_code == c.college_code).limit(20)
        )
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



async def get_llm_chat_stream_response(messages: list, db_facts: str):
    """
    Call OpenAI API to generate JSONL response (streaming generator)
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
            raise ValueError("No OpenAI / OpenRouter API Key configured.")
            
        client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url
        )
        
        response = await client.chat.completions.create(
            model=model,
            messages=enriched_messages,
            max_tokens=2000,
            stream=True
        )
        async for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    except Exception as e:
        print(f"Error calling LLM API: {e}")
        fallback_spec = '{"type": "Callout", "props": {"tone": "danger", "text": "Error calling LLM provider."}}\n'
        yield fallback_spec
