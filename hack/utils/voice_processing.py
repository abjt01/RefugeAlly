# utils/voice_processor.py
import json
import datetime
from typing import Optional, Dict, Any
import os
import tempfile

import speech_recognition as sr
from pydub import AudioSegment

from config import SUPPORTED_LANGUAGES

# Gemini wrapper from earlier in your project
from utils.ai_processor import MentalHealthAI, MissingAPIKeyError

class VoiceProcessor:
    def __init__(self, ai_model: str = "gemini-pro-small", enable_ai: bool = True):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8

        # AI wrapper (optional)
        self.ai = None
        if enable_ai:
            try:
                self.ai = MentalHealthAI(model=ai_model_
