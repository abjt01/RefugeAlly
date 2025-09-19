from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import httpx
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI(title="RefugeAlly Loom Mental Health", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDavUxT1qgrybXOsrcF-q6Yq_MCBmJxnjc")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

class ChatInput(BaseModel):
    text: str
    language: str = "en"
    user_id: str = "anonymous"

class MoodInput(BaseModel):
    emoji: str
    user_id: str = "anonymous"
    notes: str = ""

@app.post("/mental-health/chat")
async def mental_health_chat(input_data: ChatInput):
    """Trauma-informed mental health chat"""
    try:
        # Crisis detection
        crisis_keywords = [
            "suicide", "kill myself", "end it all", "hopeless", "want to die",
            "harm myself", "can't go on", "worthless", "better off dead"
        ]
        
        user_text_lower = input_data.text.lower()
        is_crisis = any(keyword in user_text_lower for keyword in crisis_keywords)
        
        if is_crisis:
            return {
                "success": True,
                "response": "I'm very concerned about you. Please reach out for immediate help:\n\n🚨 Crisis Helpline: 988 (US)\n🌍 International: 1-800-273-8255\n\nYou are not alone, and help is available.",
                "crisis_detected": True,
                "emergency_contacts": [
                    {"name": "Crisis Helpline", "number": "988"},
                    {"name": "International Crisis", "number": "1-800-273-8255"}
                ],
                "urgent": True
            }
        
        # Get trauma-informed AI response
        ai_response = await get_trauma_informed_response(input_data.text, input_data.language)
        
        return {
            "success": True,
            "response": ai_response,
            "crisis_detected": False,
            "support_resources": [
                "Deep breathing exercises",
                "Grounding techniques (5-4-3-2-1 method)",
                "Progressive muscle relaxation",
                "Mindfulness meditation"
            ]
        }
        
    except Exception as e:
        return {
            "success": False,
            "response": "I'm here to support you. Sometimes I have technical difficulties, but your feelings are always valid. Would you like to try sharing again?",
            "error": str(e)
        }

@app.post("/mental-health/mood")
async def log_mood(mood_data: MoodInput):
    """Log mood and provide personalized intervention"""
    try:
        mood_interventions = {
            "😊": {
                "message": "I'm so glad you're feeling good! 🌟",
                "intervention": "This is wonderful! Try writing down 3 things you're grateful for today to keep this positive momentum.",
                "activities": ["Journaling", "Share positivity with others", "Nature walk"]
            },
            "😢": {
                "message": "I see you're feeling sad. That's completely okay. 💙",
                "intervention": "Sadness is a natural emotion. Would you like to try some gentle breathing exercises or talk about what's on your mind?",
                "activities": ["Deep breathing", "Gentle movement", "Reach out to a friend"]
            },
            "😰": {
                "message": "I notice you're feeling anxious. Let's work through this together. 🤝",
                "intervention": "Try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
                "activities": ["Grounding exercises", "Slow breathing", "Progressive muscle relaxation"]
            },
            "😡": {
                "message": "I understand you're feeling angry. That's a valid emotion. 🔥",
                "intervention": "Take slow, deep breaths. Try counting to 10. Physical activity like walking can also help release this energy safely.",
                "activities": ["Deep breathing", "Physical exercise", "Journaling emotions"]
            },
            "😴": {
                "message": "Feeling tired is your body's way of asking for care. 💤",
                "intervention": "Rest is important for healing. Try to get adequate sleep and gentle self-care activities.",
                "activities": ["Rest", "Gentle stretching", "Calming tea"]
            }
        }
        
        intervention_data = mood_interventions.get(mood_data.emoji, {
            "message": "Thank you for sharing your mood with me. 💚",
            "intervention": "Every feeling is valid. Would you like to talk about what you're experiencing?",
            "activities": ["Mindful breathing", "Self-compassion", "Gentle movement"]
        })
        
        # Save mood log (in production, save to database)
        mood_log = {
            "user_id": mood_data.user_id,
            "emoji": mood_data.emoji,
            "notes": mood_data.notes,
            "timestamp": datetime.now().isoformat(),
            "intervention_provided": intervention_data["intervention"]
        }
        
        return {
            "success": True,
            "message": intervention_data["message"],
            "intervention": intervention_data["intervention"],
            "suggested_activities": intervention_data["activities"],
            "mood_logged": True,
            "follow_up": "How are you feeling after trying these suggestions?"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_trauma_informed_response(user_text: str, language: str = "en"):
    """Get trauma-informed response from Gemini AI"""
    try:
        # Filter sensitive content
        if any(topic in user_text.lower() for topic in ['country', 'family', 'home', 'parents']):
            return "I understand this might be difficult to talk about. Let's focus on how you're feeling right now and what support you need today. I'm here to listen without judgment."
        
        prompt = f"""You are a trauma-informed, culturally-sensitive mental health chatbot specifically for refugees and displaced people.

CRITICAL GUIDELINES:
- NEVER ask about their home country, family separation, or trauma details
- Be gentle, warm, and supportive
- Focus on present emotions and immediate coping
- Provide practical, simple mental health techniques
- Show cultural sensitivity and respect
- Keep responses concise but caring
- Emphasize their strength and resilience

User language: {language}
User says: {user_text}

Respond with empathy and practical support. Focus on their current emotional state and immediate wellbeing."""
        
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
        }
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(GEMINI_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            ai_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            return ai_text if ai_text else "I'm here to support you. How can I help you feel a bit better today?"
            
    except Exception as e:
        return "I'm here to listen and support you. Sometimes technology has hiccups, but your feelings are always important to me. Would you like to share what's on your mind?"

@app.get("/mental-health/resources")
async def get_resources():
    """Get mental health resources"""
    return {
        "success": True,
        "resources": {
            "crisis_hotlines": [
                {"name": "National Crisis Hotline", "number": "988", "available": "24/7"},
                {"name": "Crisis Text Line", "number": "Text HOME to 741741", "available": "24/7"}
            ],
            "coping_techniques": [
                {
                    "name": "Box Breathing",
                    "description": "Breathe in for 4, hold for 4, out for 4, hold for 4",
                    "duration": "2-5 minutes"
                },
                {
                    "name": "5-4-3-2-1 Grounding",
                    "description": "Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste",
                    "duration": "3-5 minutes"
                }
            ],
            "self_care": [
                "Drink water", "Take a warm shower", "Listen to calm music",
                "Write in a journal", "Do gentle stretching", "Call a friend"
            ]
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "RefugeAlly Loom Mental Health",
        "features": [
            "Trauma-informed chat",
            "Crisis detection", 
            "Mood tracking",
            "Cultural sensitivity",
            "Multi-language support"
        ],
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6000)
