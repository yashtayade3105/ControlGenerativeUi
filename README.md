# SGBAU Nexus: Controlled Generative UI Engine
An implementation of the Controlled Generative UI pattern applied to Sant Gadge Baba Amravati University (SGBAU) academic search operations.

---

## Technical Overview
This project validates the Controlled Generative UI pattern. Traditional chat interfaces stream raw Markdown or HTML strings, which increases rendering latency, token consumption, and layout instability. This implementation shifts structural layout decisions to the language model at runtime using a lightweight JSON specification, leaving styling control and component stability strictly managed by the React frontend.

```
┌──────────────────┐      JSON Specification      ┌──────────────────┐
│   FastAPI RAG    │ ───────────────────────────> │  React Frontend  │
│  Backend Engine  │      (Low Token Cost)        │  Component Map   │
└──────────────────┘                              └──────────────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │ Predefined React │
                                                  │    Components    │
                                                  └──────────────────┘
```

### Performance Metrics
- **Token Efficiency**: A layout that requires 400+ tokens of raw HTML markup requires only ~40 tokens of JSON specification. This results in a 75% to 85% savings on model output tokens.
- **Rendering Reliability**: Components handle their own visual states and data bindings. Malformed model outputs do not compromise application stability.
- **Layout Consistency**: Predefined components ensure that branding guidelines and CSS structures remain intact regardless of model variation.

---

## System Architecture

### Component Registry
The frontend maps JSON specifications to 14 predefined components:
1. `Callout`: Status banners supporting semantic states (info, success, warning, danger).
2. `BranchForm`: Input forms capturing branch selections and percentile limits.
3. `CollegeCard`: Summary layouts displaying admission chances.
4. `CutoffTable`: Tabular view of historical percentiles.
5. `AdmissionTimeline`: Horizontal layouts showing CAP round schedules.
6. `DocumentsRequired`: List of documents required based on category.
7. `FeeStructure`: Categorized annual fee breakdowns.
8. `FacilitiesList`: Campus utility tagging badges.
9. `PlacementStats`: Layouts highlighting packages and recruiters.
10. `ScholarshipCard`: Scholarship eligibility criteria and benefit details.
11. `LocationMap`: Address, city, and geographical distances.
12. `ContactCard`: Admission support helpline and email info.
13. `FAQAccordion`: Collapsible guides for common admission queries.
14. `UserReview`: Student ratings and testimonials.

---

## Directory Structure

```
Project_Verision_1/
├── Backend/                    # FastAPI Server Application
│   ├── app/
│   │   ├── db/                 # DB Session & Schema Models
│   │   ├── routers/            # Authentication & Chat routers
│   │   ├── schemas/            # Pydantic Schemas (API validation)
│   │   └── services/           # LLM Prompt builders & validation layers
│   ├── requirements.txt
│   └── .env
│
├── Frontend/                   # React + Vite Sandbox Application
│   ├── src/
│   │   ├── components/         # 14 Predefined Registry Components
│   │   ├── App.jsx             # Chat Interface & Preset Simulator
│   │   └── index.css           # Global Design Tokens
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore                  # Global Monorepo Ignores
```

---

## Setup and Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Active OpenAI/OpenRouter API credentials

---

### Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root of the `Backend/` directory:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/db_name
   SECRET_KEY=your_jwt_signing_secret
   OPENAI_API_KEY=your_llm_api_key
   OPENAI_BASE_URL=https://openrouter.ai/api/v1
   OPENAI_MODEL=openrouter/free
   ```
5. Start the development server:
   ```bash
   python -m app.main
   ```

---

### Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`.

---

## Validation and Fault Tolerance
- **Backend Sanitization (`app/services/validator.py`)**: Intercepts model generation streams, cleans code blocks, handles unclosed JSON structures, and validates schemas against Pydantic definitions before serialization.
- **Graceful Degradation (`GenerativeRenderer.jsx`)**: Unrecognized component types requested by the model are mapped to a fallback alert message (`UnknownComponent`), preventing application crashes.
