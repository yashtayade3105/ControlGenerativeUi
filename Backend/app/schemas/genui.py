from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional

class GenUISource(BaseModel):
    type: str
    reference: Optional[str] = None
    name: Optional[str] = None

    @validator('name', pre=True, always=True)
    def resolve_name(cls, v, values):
        # Fallback to reference if name is not present
        if not v:
            return values.get('reference') or "Unknown"
        return v

class GenUIComponent(BaseModel):
    id: str
    type: str
    props: Dict[str, Any]

    @validator('props', pre=True)
    def clean_props(cls, v):
        if not isinstance(v, dict):
            return {}
        # Clean null, undefined, NaN values
        cleaned = {}
        for key, value in v.items():
            if value is None or value == "undefined" or str(value) == "NaN":
                # Omit or default to "Unknown"
                cleaned[key] = "Unknown"
            else:
                cleaned[key] = value
        return cleaned

class GenUIResponse(BaseModel):
    version: str = Field(default="1.0")
    intent: str
    confidence: float = Field(ge=0.0, le=1.0)
    components: List[GenUIComponent]
    sources: List[GenUISource]

    @validator('components')
    def validate_components(cls, v):
        # Check unique IDs
        ids = set()
        registered_types = {
            "callout", "collegecard", "cutofftable", "branchform",
            "admissiontimeline", "documentsrequired", "feestructure",
            "facilitieslist", "placementstats", "scholarshipcard",
            "locationmap", "contactcard", "faqaccordion", "userreview"
        }
        
        for idx, comp in enumerate(v):
            if comp.id in ids:
                comp.id = f"cmp_{idx+1:03d}"
            ids.add(comp.id)

            # Normalize type format and validate
            comp_type_lower = comp.type.lower()
            if comp_type_lower not in registered_types:
                # Map unknown to Callout tone warning fallback
                comp.type = "Callout"
                comp.props = {
                    "tone": "warn",
                    "text": f"Unrecognized backend component mapping request for '{comp.type}'"
                }
                
        return v
