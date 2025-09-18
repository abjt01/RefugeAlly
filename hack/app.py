print("=== STARTING app.py ===")


from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime

app = FastAPI()
from fastapi import FastAPI, File, UploadFile

app = FastAPI()

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    ...

# Enable CORS if frontend on different host (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

### CrisisDetector class
class CrisisDetector:
    def __init__(self):
        self.crisis_keywords = [
            "suicide", "kill myself", "end it all", "want to die",
            "hopeless", "no hope", "panic attack"
        ]

    def check_crisis(self, message: str):
        message_lower = message.lower()
        for keyword in self.crisis_keywords:
            if keyword in message_lower:
                return True, f"Keyword '{keyword}' detected", "keyword_match"
        return False, "", ""

### MoodTracker class
class MoodTracker:
    def __init__(self):
        self.mood_log = []

    def track_mood(self, mood_data: dict):
        score = mood_data.get('score', 5)
        suggestion = "Keep tracking your mood regularly."
        self.mood_log.append({'score': score, 'timestamp': mood_data.get('timestamp')})

        if score < 4:
            suggestion = "Consider doing activities you enjoy or talking to someone."

        return score, suggestion

    def get_mood_trend(self, use_ai_summary=False):
        if not self.mood_log:
            return {"trend": "No data", "ai_insight": ""}
        avg_score = sum(entry['score'] for entry in self.mood_log) / len(self.mood_log)
        return {
            "trend": f"Average mood score: {avg_score:.1f}",
            "ai_insight": "Keep monitoring to see your emotional patterns."
        }

### VoiceProcessor class
class VoiceProcessor:
    def __init__(self):
        pass

    async def transcribe_audio(self, audio_file: UploadFile, analyze_with_ai: bool = False):
        # Placeholder - implement actual transcription with AI if needed
        transcript = "Transcribed text would be here."
        success = True
        return {"text": transcript, "success": success, "error": None}

### MentalHealthAI class
class MentalHealthAI:
    def __init__(self):
        pass

    def analyze_text(self, prompt: str):
        summary = "This is a supportive summary based on your input."
        return {"summary": summary}

## Instantiate classes
crisis_detector = CrisisDetector()
mood_tracker = MoodTracker()
voice_processor = VoiceProcessor()
ai_processor = MentalHealthAI()

# Simple in-memory session replacement
conversation_history = []
mood_data_log = []

# Routes

@app.get("/", response_class=HTMLResponse)
async def index():
    html_content = "<html><body><h1>FastAPI Mental Health Support App</h1></body></html>"
    return HTMLResponse(content=html_content, status_code=200)

@app.post("/chat")
async def chat(user_message: dict):
    message = user_message.get("message", "")

    crisis_detected, detail, source = crisis_detector.check_crisis(message)

    if crisis_detected:
        response_msg = (
            f"I'm deeply concerned about what you're sharing. Your feelings are valid and it's important to get support right now. "
            f"Please contact emergency services immediately. I'm here to listen until you can connect with them."
        )
        return JSONResponse({
            "message": response_msg,
            "crisis_detected": True,
            "emergency_resources": ["International Crisis Line: +443334184060"]
        })

    # Add to conversation history
    conversation_history.append({"sender": "user", "message": message, "time": datetime.now().isoformat()})

    prompt = "\n".join([f"{msg['sender']}: {msg['message']}" for msg in conversation_history]) + f"\nuser: {message}"

    ai_response = ai_processor.analyze_text(prompt).get("summary", "I'm here to support you.")

    conversation_history.append({"sender": "bot", "message": ai_response, "time": datetime.now().isoformat()})

    return JSONResponse({"message": ai_response, "crisis_detected": False})

@app.post("/track_mood")
async def track_mood(mood: dict):
    score, suggestion = mood_tracker.track_mood(mood)
    mood_data_log.append({
        "score": score,
        "emoji": mood.get("emoji", ""),
        "timestamp": datetime.now().isoformat(),
        "note": mood.get("note", "")
    })

    mood_analysis = mood_tracker.get_mood_trend() if len(mood_data_log) >= 3 else {}

    return JSONResponse({"score": score, "suggestion": suggestion, "mood_analysis": mood_analysis})

from fastapi import File, Form

@app.post("/upload")
def upload_file(file: bytes = File(...), description: str = Form(...)):
    ...


@app.post("/upload")
def upload_file(file: bytes = File(...), description: str = Form(...)):
    ...
async def transcribe(audio: UploadFile = File(...)):
    result = await voice_processor.transcribe_audio(audio)
    return JSONResponse(result)
