import httpx
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

async def get_gemini_response(user_text: str, user_lang: str) -> str:
    prompt = {
        "contents": [{
            "parts": [{
                "text": f"You are a trauma-informed, culturally-sensitive mental health chatbot for refugees.\nUser language: {user_lang}\nUser says: {user_text}"
            }]
        }]
    }
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(GEMINI_API_URL, json=prompt, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
from fastapi import APIRouter, HTTPException
from app.schemas.request_models import ChatInput
from app.chatbot import get_gemini_response  # or from app.nlp if you placed the function there

router = APIRouter()

@router.post("/")
async def chat_endpoint(inp: ChatInput):
    try:
        raw_response = await get_gemini_response(inp.text, inp.language)
        return {"response": raw_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
