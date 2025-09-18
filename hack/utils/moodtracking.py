# utils/mood_tracker.py
import json
import datetime
from typing import Dict, List, Tuple, Optional
import numpy as np

# Keep your existing config import for emoji -> score mapping
from config import MOOD_EMOJIS

# Gemini wrapper from earlier in the project
from utils.ai_processor import MentalHealthAI, MissingAPIKeyError

class MoodTracker:
    def __init__(self, ai_model: str = "gemini-pro-small", enable_ai: bool = True):
        self.mood_emojis = MOOD_EMOJIS
        self.mood_history: List[Dict] = []

        # Try to initialize Gemini wrapper, but tolerate missing key/library
        self.ai = None
        if enable_ai:
            try:
                self.ai = MentalHealthAI(model=ai_model)
            except MissingAPIKeyError:
                # No API key configured; continue without AI
                self.ai = None
            except Exception:
                # Any other error when creating the w
