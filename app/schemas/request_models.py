from pydantic import BaseModel

class ChatInput(BaseModel):
    text: str
    language: str
