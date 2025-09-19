import httpx
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async def get_gemini_response(user_text: str, user_lang: str) -> str:
    prompt = (
        "You are a trauma-informed, culturally-sensitive mental health chatbot for refugees. "
        "Do NOT ask about home countries or family separation. Respond gently and supportively. "
        f"User language: {user_lang}. User says: {user_text}"
    )
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
    }
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(GEMINI_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        # Gemini returns a nested structure; extract the response text
        return data["candidates"][0]["content"]["parts"]