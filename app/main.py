from fastapi import FastAPI
from app.chatbot import get_gemini_response
from app.crisis import router as crisis_router
from app.mood import router as mood_router
from app.utils import filter_sensitive_content
from pydantic import BaseModel

app = FastAPI()

app.include_router(crisis_router, prefix="/crisis")
app.include_router(mood_router, prefix="/mood")

class ChatInput(BaseModel):
    text: str
    language: str

@app.post("/chat")
async def chat_endpoint(inp: ChatInput):
    # 1. Get Gemini AI response
    raw_response = await get_gemini_response(inp.text, inp.language)
    # 2. Filter for sensitive topics
    safe_response = filter_sensitive_content(raw_response)
    return {"response": safe_response}
from fastapi import FastAPI
from app.nlp.chatbot import router as chatbot_router

app = FastAPI()
app.include_router(chatbot_router, prefix="/chat")
