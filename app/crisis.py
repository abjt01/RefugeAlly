from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end it all", "hopeless", "abuse", "emergency", "danger"
]

class TextInput(BaseModel):
    text: str

@router.post("/check")
async def check_crisis(input: TextInput):
    text = input.text.lower()
    triggered = any(keyword in text for keyword in CRISIS_KEYWORDS)
    if triggered:
        # Example emergency contact - customize per locale or user details
        contact_info = "Emergency mental health support: 1800-123-4567"
        return {"crisis_detected": True, "emergency_contact": contact_info}
    return {"crisis_detected": False}
