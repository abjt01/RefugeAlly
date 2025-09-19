from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MoodInput(BaseModel):
    emoji: str

MOOD_INTERVENTIONS = {
    "😀": "Keep up your great mood! Maybe try journaling today.",
    "😞": "Try some deep breathing exercises or a walk outside.",
    "😡": "Take a moment to pause and identify your feelings.",
    "😭": "It's okay to cry. Reach out to someone you trust.",
}

@router.post("/log")
async def log_mood(mood: MoodInput):
    suggestion = MOOD_INTERVENTIONS.get(mood.emoji, "Would you like a guided meditation?")
    # Store mood logs in real deployment
    return {"message": "Mood recorded", "intervention": suggestion}
