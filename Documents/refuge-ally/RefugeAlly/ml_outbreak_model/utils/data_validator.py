from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from models.schemas import CampLocation, WeatherData, SocialMediaData, HealthIndicator

logger = logging.getLogger(__name__)

class DataValidator:
    """Utility class for validating incoming data"""
    
    @staticmethod
    def validate_camp_data(camp_data: Dict[str, Any]) -> bool:
        """Validate camp registration data"""
        required_fields = ['camp_id', 'name', 'latitude', 'longitude', 'population', 'country']
        
        try:
            # Check required fields
            for field in required_fields:
                if field not in camp_data:
                    logger.error(f"Missing required field: {field}")
                    return False
            
            # Validate coordinates
            lat, lon = camp_data['latitude'], camp_data['longitude']
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                logger.error(f"Invalid coordinates: {lat}, {lon}")
                return False
            
            # Validate population
            if camp_data['population'] < 0:
                logger.error(f"Invalid population: {camp_data['population']}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Camp data validation error: {e}")
            return False
    
    @staticmethod
    def validate_weather_data(weather_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate and clean weather data"""
        valid_data = []
        
        for record in weather_data:
            try:
                # Check required fields
                required_fields = ['camp_id', 'temperature', 'humidity', 'rainfall', 'wind_speed']
                if not all(field in record for field in required_fields):
                    continue
                
                # Validate ranges
                temp = record['temperature']
                humidity = record['humidity']
                rainfall = record['rainfall']
                wind_speed = record['wind_speed']
                
                if not (-50 <= temp <= 60):  # Reasonable temperature range
                    continue
                if not (0 <= humidity <= 100):  # Humidity percentage
                    continue
                if rainfall < 0 or wind_speed < 0:  # Non-negative values
                    continue
                
                # Add timestamp if missing
                if 'timestamp' not in record:
                    record['timestamp'] = datetime.utcnow()
                
                valid_data.append(record)
                
            except Exception as e:
                logger.error(f"Weather record validation error: {e}")
                continue
        
        return valid_data
    
    @staticmethod
    def validate_social_media_data(social_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate and clean social media data"""
        valid_data = []
        
        for record in social_data:
            try:
                # Check required fields
                required_fields = ['camp_id', 'platform', 'text', 'sentiment_score']
                if not all(field in record for field in required_fields):
                    continue
                
                # Validate sentiment score
                sentiment = record['sentiment_score']
                if not (-1 <= sentiment <= 1):
                    continue
                
                # Validate text length
                if len(record['text']) > 1000:  # Truncate long text
                    record['text'] = record['text'][:1000]
                
                # Add timestamp if missing
                if 'timestamp' not in record:
                    record['timestamp'] = datetime.utcnow()
                
                # Ensure symptom_keywords is a list
                if 'symptom_keywords' not in record:
                    record['symptom_keywords'] = []
                
                valid_data.append(record)
                
            except Exception as e:
                logger.error(f"Social media record validation error: {e}")
                continue
        
        return valid_data
