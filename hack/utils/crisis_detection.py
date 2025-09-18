import re
import json
from fastapi import FastAPI
from pydantic import BaseModel

# Crisis keywords for quick detection
CRISIS_KEYWORDS = ["suicide", "kill myself", "need help", "help", "emergency"]

app = FastAPI()

# Request schema
class ChatRequest(BaseModel):
    message: str

import re

def check_crisis(user_message: str) -> bool:
    user_message_lower = user_message.lower()
    for keyword in CRISIS_KEYWORDS:
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, user_message_lower):
            return True
    return False


# Crisis detection class
class CrisisDetector:
    def __init__(self, ai_processor=None):
        self.ai_processor = ai_processor

    def check_crisis(self, message: str):
        """
        Basic keyword check for crisis signals.
        Returns: (is_crisis: bool, reason: str, method: str)
        """
        keywords = ["suicide", "kill myself", "end my life", "harm", "die"]
        for word in keywords:
            if word in message.lower():
                return True, f"Keyword match: {word}", "keyword"
        return False, "", "no crisis"

    def contextual_crisis_check(self, message: str):
        """
        Use AI to check for crisis context beyond keywords.

        Expects the AI to respond with JSON:
        {"crisis_level": 1-3, "explanation": "brief reason"}

        Returns:
            (is_crisis: bool, explanation: str, method: str)
        """
        if not self.ai_processor:
            return False, "", "no ai"

        try:
            prompt = f"""
Analyze this message from a refugee mental health context: "{message}"

Determine if the person is expressing:
1. Immediate harm to self or others
2. Severe emotional crisis needing intervention
3. General distress that doesn't require emergency response

Respond with ONLY a JSON format: {{"crisis_level": 1-3, "explanation": "brief reason"}}
"""
            response = self.ai_processor.analyze_text(prompt)
            summary = response.get("summary", "")

            # Try to extract JSON from the response
            match = re.search(r'\{.*\}', summary, re.DOTALL)
            if not match:
                return False, "AI response not in expected format", "error"

            crisis_data = json.loads(match.group(0))

            level = crisis_data.get("crisis_level")
            explanation = crisis_data.get("explanation", "")

            if level == 1:
                return True, explanation or "Immediate harm indicated", "context"
            elif level == 2:
                return True, explanation or "Severe emotional crisis", "context"
            else:
                return False, explanation or "", "no crisis"

        except Exception as e:
            print(f"Error in contextual crisis detection: {e}")
            return False, "", "error"

# FastAPI route
@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.message
    crisis = check_crisis(user_message)
    return {"response": "Got it!", "crisis_detected": crisis}
