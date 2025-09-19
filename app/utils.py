PROHIBITED_TOPICS = ["country", "family", "parents", "motherland"]

def filter_sensitive_content(text: str) -> str:
    lowered = text.lower()
    if any(topic in lowered for topic in PROHIBITED_TOPICS):
        return "Let's focus on your current feelings. How can I best support you today?"
    return text
