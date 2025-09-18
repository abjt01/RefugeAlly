# utils/prompts/trauma_prompts.py
TRAUMA_PROMPTS = {
    "triage_system": (
        "You are a compassionate, trauma-informed assistant experienced working with refugees. "
        "Given a short transcript, respond with ONLY a single JSON object with keys: "
        "'risk' (one of 'none','low','medium','high'), 'explanation' (brief reason), "
        "'recommended_action' (one-line non-clinical next step)."
    ),
    "short_support": "Give one short empathetic sentence and one practical step."
}
