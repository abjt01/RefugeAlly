import os
from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "outbreak_prediction"
    REDIS_URL: str = "redis://localhost:6379"
    
  
    WEATHER_API_KEY: Optional[str] = "7a16f2f0b10e6c2e17c9b96ab09c5efe"
    
    # Twilio
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None
    
    # ML Models
    MODEL_UPDATE_INTERVAL: int = 3600  # seconds
    RISK_THRESHOLD_HIGH: float = 0.8
    RISK_THRESHOLD_MEDIUM: float = 0.5
    
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()