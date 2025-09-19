import asyncio
import logging
from typing import List, Dict, Any
from datetime import datetime
from services.db_handler import DatabaseHandler
from services.weather_ingestor import WeatherIngestor

from models.schemas import DataIngestionResponse

logger = logging.getLogger(__name__)

class IngestionService:
    def __init__(self):
        self.db_handler = DatabaseHandler()
        self.weather_ingestor = WeatherIngestor()
    
    
    async def run_full_ingestion(self) -> DataIngestionResponse:
        """Run complete data ingestion for all camps"""
        start_time = datetime.utcnow()
        total_records = 0
        errors = []
        
        try:
            # Get all registered camps
            camps = await self.db_handler.get_all_camps()
            if not camps:
                logger.warning("No camps registered for data ingestion")
                return DataIngestionResponse(
                    status="no_camps",
                    records_processed=0,
                    timestamp=start_time,
                    errors=["No camps registered"]
                )
            
            # Fetch weather data
            try:
                weather_data = await self.weather_ingestor.fetch_weather_data(camps)
                weather_count = await self.db_handler.insert_weather_data(weather_data)
                total_records += weather_count
                logger.info(f"Ingested {weather_count} weather records")
            except Exception as e:
                error_msg = f"Weather ingestion failed: {e}"
                errors.append(error_msg)
                logger.error(error_msg)
            
            # Fetch social media data
            try:
                social_data = await self.twitter_ingestor.fetch_social_media_data(camps)
                social_count = await self.db_handler.insert_social_media_data(social_data)
                total_records += social_count
                logger.info(f"Ingested {social_count} social media records")
            except Exception as e:
                error_msg = f"Social media ingestion failed: {e}"
                errors.append(error_msg)
                logger.error(error_msg)
            
            # Generate simulated health data for demo
            try:
                health_data = await self._generate_simulated_health_data(camps)
                health_count = await self.db_handler.insert_health_indicators(health_data)
                total_records += health_count
                logger.info(f"Ingested {health_count} health indicator records")
            except Exception as e:
                error_msg = f"Health data generation failed: {e}"
                errors.append(error_msg)
                logger.error(error_msg)
            
            status = "success" if not errors else "partial_success"
            
            return DataIngestionResponse(
                status=status,
                records_processed=total_records,
                timestamp=start_time,
                errors=errors
            )
            
        except Exception as e:
            logger.error(f"Full ingestion failed: {e}")
            return DataIngestionResponse(
                status="failed",
                records_processed=total_records,
                timestamp=start_time,
                errors=[str(e)]
            )
    
    async def _generate_simulated_health_data(self, camps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate simulated health data for demonstration"""
        import random
        from datetime import timedelta
        
        health_data = []
        indicators = ['fever', 'diarrhea', 'respiratory', 'headache', 'fatigue']
        
        for camp in camps:
            # Generate 1-5 health indicators per camp
            num_indicators = random.randint(1, 5)
            
            for _ in range(num_indicators):
                indicator_type = random.choice(indicators)
                count = random.randint(0, 15)  # 0-15 cases
                severity = random.uniform(0.1, 1.0)  # Severity score
                
                # Add some time variation
                timestamp_offset = random.randint(0, 1440)  # 0-24 hours ago
                timestamp = datetime.utcnow() - timedelta(minutes=timestamp_offset)
                
                health_data.append({
                    'camp_id': camp['camp_id'],
                    'indicator_type': indicator_type,
                    'count': count,
                    'severity': severity,
                    'timestamp': timestamp
                })
        
        return health_data