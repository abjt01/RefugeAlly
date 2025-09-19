import aiohttp
import asyncio
import logging
from typing import List, Dict, Any
from datetime import datetime
from config.settings import settings

logger = logging.getLogger(__name__)

class WeatherIngestor:
    def __init__(self):
        self.api_key = settings.WEATHER_API_KEY
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"
        
    async def fetch_weather_data(self, camps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Fetch weather data for all camps"""
        if not self.api_key:
            logger.warning("Weather API key not configured")
            return []
            
        weather_data = []
        
        async with aiohttp.ClientSession() as session:
            tasks = [self._fetch_camp_weather(session, camp) for camp in camps]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, dict):
                    weather_data.append(result)
                elif isinstance(result, Exception):
                    logger.error(f"Weather fetch error: {result}")
                    
        return weather_data
    
    async def _fetch_camp_weather(self, session: aiohttp.ClientSession, camp: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch weather data for a single camp"""
        params = {
            'lat': camp['latitude'],
            'lon': camp['longitude'],
            'appid': self.api_key,
            'units': 'metric'
        }
        
        try:
            async with session.get(self.base_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'camp_id': camp['camp_id'],
                        'temperature': data['main']['temp'],
                        'humidity': data['main']['humidity'],
                        'rainfall': data.get('rain', {}).get('1h', 0),
                        'wind_speed': data['wind']['speed'],
                        'timestamp': datetime.utcnow()
                    }
                else:
                    logger.error(f"Weather API error {response.status} for camp {camp['camp_id']}")
                    return {}
                    
        except Exception as e:
            logger.error(f"Weather fetch error for camp {camp['camp_id']}: {e}")
            return {}
