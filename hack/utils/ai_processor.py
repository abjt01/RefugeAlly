# utils/ai_processor.py
"""
Wrapper for using a Gemini (Google Generative) API key to call a model.
Reads API key from the environment variable GEMINI_API_KEY by default.
"""
import os
import logging
from typing import Optional, Dict, Any
import json

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Relative import for prompts inside the utils package
from .prompts.trauma_prompts import TRAUMA_PROMPTS

# Try to import the official Google GenAI python package if available.
try {
    import google.generativeai as genai  # type: ignore
    _GENAI_AVAILABLE = True
} except Exception {
    genai = None  # type: ignore
    _GENAI_AVAILABLE = False
}

class MissingAPIKeyError(RuntimeError):
    pass

class MentalHealthAI:
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-pro-small"):
        """
        Create the AI wrapper.

        Args:
            api_key: Optional API key string. If not provided, will read from env var GEMINI_API_KEY.
            model: Model name you want to call (set appropriate Gemini model available to you).
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise MissingAPIKeyError(
                "GEMINI_API_KEY not found. Please set the GEMINI_API_KEY environment variable "
                "or pass api_key to MentalHealthAI()."
            )

        self.model = model

        if _GENAI_AVAILABLE:
            # configure the genai client with your key
            try:
                genai.configure(api_key=self.api_key)
                logger.info("google.generativeai configured successfully.")
            except Exception as e:
                logger.warning("Could not configure google.generativeai automatically: %s", e)
        else:
            logger.warning(
                "google.generativeai library not found. Install it with: pip install google-generativeai"
            )

    def analyze_text(self, prompt: str) -> Dict[str, Any]:
        """
        Analyze text using the configured Gemini model. Returns a dict with keys:
        - success (bool)
        - summary (str) OR raw (raw provider response)
        - error (str) if any
        """
        if not _GENAI_AVAILABLE:
            return {"success": False, "error": "google.generativeai not installed"}

        try:
            # try chat style if available
            try:
                response = genai.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.0,
                    max_output_tokens=512
                )
                # many genai versions place text in response.choices[0].message.content
                text = None
                if hasattr(response, "choices"):
                    try:
                        text = response.choices[0].message.content
                    except Exception:
                        text = str(response)
                else:
                    text = str(response)
                return {"success": True, "summary": text, "raw": response}
            except Exception:
                # fallback to generate_text style
                response = genai.generate_text(model=self.model, prompt=prompt, temperature=0.0, max_output_tokens=512)
                # try to extract text
                text = None
                if hasattr(response, "output"):
                    gens = getattr(response, "output").get("generations", [])
                    if gens:
                        text = gens[0].get("text") if isinstance(gens[0], dict) else str(gens[0])
                if text is None:
                    text = str(response)
                return {"success": True, "summary": text, "raw": response}
        except Exception as e:
            logger.exception("Error calling Gemini: %s", e)
            return {"success": False, "error": str(e)}
