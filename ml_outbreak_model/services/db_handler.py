import motor.motor_asyncio
from pymongo import IndexModel, ASCENDING, DESCENDING
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

class DatabaseHandler:
    def __init__(self):
        self.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.client[settings.MONGODB_DB_NAME]
        
    async def init_db(self):
        """Initialize database with required indexes"""
        try:
            # Create indexes for better performance
            collections_indexes = {
                "weather_data": [
                    IndexModel([("camp_id", ASCENDING), ("timestamp", DESCENDING)]),
                    IndexModel([("timestamp", DESCENDING)])
                ],
                "social_media_data": [
                    IndexModel([("camp_id", ASCENDING), ("timestamp", DESCENDING)]),
                    IndexModel([("timestamp", DESCENDING)])
                ],
                "health_indicators": [
                    IndexModel([("camp_id", ASCENDING), ("timestamp", DESCENDING)]),
                    IndexModel([("indicator_type", ASCENDING)])
                ],
                "predictions": [
                    IndexModel([("camp_id", ASCENDING), ("timestamp", DESCENDING)]),
                    IndexModel([("expires_at", ASCENDING)])  # TTL index
                ],
                "camps": [
                    IndexModel([("camp_id", ASCENDING)], unique=True)
                ]
            }
            
            for collection_name, indexes in collections_indexes.items():
                collection = self.db[collection_name]
                await collection.create_indexes(indexes)
                
            logger.info("Database initialization completed")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise

    async def insert_weather_data(self, data: List[Dict[str, Any]]) -> int:
        """Insert weather data records"""
        if not data:
            return 0
        result = await self.db.weather_data.insert_many(data)
        return len(result.inserted_ids)

    async def insert_social_media_data(self, data: List[Dict[str, Any]]) -> int:
        """Insert social media data records"""
        if not data:
            return 0
        result = await self.db.social_media_data.insert_many(data)
        return len(result.inserted_ids)

    async def insert_health_indicators(self, data: List[Dict[str, Any]]) -> int:
        """Insert health indicator records"""
        if not data:
            return 0
        result = await self.db.health_indicators.insert_many(data)
        return len(result.inserted_ids)

    async def save_prediction(self, prediction: Dict[str, Any]) -> str:
        """Save outbreak prediction"""
        result = await self.db.predictions.insert_one(prediction)
        return str(result.inserted_id)

    async def get_recent_data(self, camp_id: str, hours: int = 24) -> Dict[str, List[Dict]]:
        """Get recent data for ML processing"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        query = {
            "camp_id": camp_id,
            "timestamp": {"$gte": cutoff_time}
        }
        
        # Fetch data from all collections
        weather_data = await self.db.weather_data.find(query).to_list(length=None)
        social_data = await self.db.social_media_data.find(query).to_list(length=None)
        health_data = await self.db.health_indicators.find(query).to_list(length=None)
        
        return {
            "weather": weather_data,
            "social_media": social_data,
            "health_indicators": health_data
        }

    async def get_all_camps(self) -> List[Dict[str, Any]]:
        """Get all registered camps"""
        camps = await self.db.camps.find({}).to_list(length=None)
        return camps

    async def register_camp(self, camp_data: Dict[str, Any]) -> str:
        """Register a new camp"""
        result = await self.db.camps.replace_one(
            {"camp_id": camp_data["camp_id"]},
            camp_data,
            upsert=True
        )
        return camp_data["camp_id"]
