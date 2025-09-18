from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class CampLocation(BaseModel):
    camp_id: str = Field(..., description="Unique camp identifier")
    name: str = Field(..., description="Camp name")
    latitude: float = Field(..., description="Camp latitude")
    longitude: float = Field(..., description="Camp longitude")
    population: int = Field(..., description="Current population")
    country: str = Field(..., description="Country code")

class WeatherData(BaseModel):
    camp_id: str
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    timestamp: datetime

class SocialMediaData(BaseModel):
    camp_id: str
    platform: str = "twitter"
    text: str
    sentiment_score: float
    symptom_keywords: List[str]
    timestamp: datetime
    user_location: Optional[Dict[str, float]] = None

class HealthIndicator(BaseModel):
    camp_id: str
    indicator_type: str  # fever, diarrhea, respiratory, etc.
    count: int
    severity: float
    timestamp: datetime

class OutbreakPrediction(BaseModel):
    camp_id: str
    risk_score: float = Field(..., ge=0, le=1)
    risk_level: RiskLevel
    predicted_disease: Optional[str] = None
    confidence: float = Field(..., ge=0, le=1)
    contributing_factors: Dict[str, float]
    timestamp: datetime
    expires_at: datetime

class AlertRequest(BaseModel):
    camp_id: str
    message: str
    severity: RiskLevel
    recipients: List[str]  # phone numbers or emails

class DataIngestionResponse(BaseModel):
    status: str
    records_processed: int
    timestamp: datetime
    errors: List[str] = []
