import asyncio
import random
from datetime import datetime, timedelta
from services.db_handler import DatabaseHandler
from models.schemas import CampLocation

async def setup_demo_camps():
    """Set up demo refugee camps for testing"""
    db_handler = DatabaseHandler()
    await db_handler.init_db()
    
demo_camps= [
    {
        "camp_id": "DEMO001",
        "name": "Al-Zaatari Camp",
        "latitude": 32.294,
        "longitude": 36.326,
        "population": 76000,
        "country": "JO"
    },
    {
        "camp_id": "DEMO001",
        "name": "Al-Zaatari Camp",
        "latitude": 32.294,
        "longitude": 36.326,
        "population": 76000,
        "country": "JO"
    },
    {
        "camp_id": "DEMO002",
        "name": "Kakuma Camp",
        "latitude": 3.739,
        "longitude": 34.814,
        "population": 185000,
        "country": "KE"
    },
    {
        "camp_id": "DEMO002",
        "name": "Kakuma Camp",
        "latitude": 3.739,
        "longitude": 34.814,
        "population": 185000,
        "country": "KE"
    },
    {
        "camp_id": "DEMO002",
        "name": "Kakuma Camp",
        "latitude": 3.739,
        "longitude": 34.814,
        "population": 185000,
        "country": "KE"
    },
    {
        "camp_id": "DEMO003",
        "name": "Cox's Bazar Camp",
        "latitude": 21.427,
        "longitude": 92.026,
        "population": 900000,
        "country": "BD"
    },
    {
        "camp_id": "DEMO003",
        "name": "Cox's Bazar Camp",
        "latitude": 21.427,
        "longitude": 92.026,
        "population": 900000,
        "country": "BD"
    },
    {
        "camp_id": "DEMO003",
        "name": "Cox's Bazar Camp",
        "latitude": 21.427,
        "longitude": 92.026,
        "population": 900000,
        "country": "BD"
    },
    {
        "camp_id": "DEMO003",
        "name": "Cox's Bazar Camp",
        "latitude": 21.427,
        "longitude": 92.026,
        "population": 900000,
        "country": "BD"
    }
]
    
for camp in demo_camps:
        await db_handler.register_camp(camp)
        print(f"Registered demo camp: {camp['name']}")
    
        print("Demo camps setup completed")

async def generate_demo_health_data():
    """Generate sample health indicator data"""
    db_handler = DatabaseHandler()
    camps = await db_handler.get_all_camps()
    
    health_data = []
    indicators = ['fever', 'diarrhea', 'respiratory', 'headache', 'fatigue', 'nausea']
    
    for camp in camps:
        # Generate data for the last 7 days
        for day_offset in range(7):
            timestamp = datetime.utcnow() - timedelta(days=day_offset)
            
            # Generate 2-6 health indicators per day
            for _ in range(random.randint(2, 6)):
                health_data.append({
                    'camp_id': camp['camp_id'],
                    'indicator_type': random.choice(indicators),
                    'count': random.randint(1, 25),
                    'severity': random.uniform(0.2, 0.9),
                    'timestamp': timestamp
                })
    
    await db_handler.insert_health_indicators(health_data)
    print(f"Generated {len(health_data)} demo health records")

if __name__ == "__main__":
    print("Setting up demo data...")
    asyncio.run(setup_demo_camps())
    asyncio.run(generate_demo_health_data())
    print("Demo data setup completed!")
    