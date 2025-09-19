import uvicorn
import logging
import signal
import sys
from threading import Thread
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

# Project imports
from config.settings import settings
from tasks.scheduler import scheduler
from models.schemas import (
    CampLocation, OutbreakPrediction, AlertRequest,
    DataIngestionResponse, RiskLevel
)
from services.db_handler import DatabaseHandler
from services.ingestion_service import IngestionService
from services.data_preprocessor import DataPreprocessor
from services.notification_service import NotificationService
from ml_core.model_loader import ModelLoader
from ml_core.predictor import OutbreakPredictor

# ----------------------------
# Logging configuration
# ----------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('outbreak_prediction.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# ----------------------------
# Initialize services
# ----------------------------
db_handler = DatabaseHandler()
ingestion_service = IngestionService()
preprocessor = DataPreprocessor()
notification_service = NotificationService()
model_loader = ModelLoader()
predictor = OutbreakPredictor(model_loader)

# ----------------------------
# Initialize FastAPI
# ----------------------------
app = FastAPI(
    title="Outbreak Prediction API",
    description="AI-powered outbreak prediction system for refugee camps",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# FastAPI startup event
# ----------------------------
@app.on_event("startup")
async def startup_event():
    try:
        await db_handler.init_db()
        model_loader.load_models()
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

# ----------------------------
# Endpoints
# ----------------------------
@app.get("/")
async def root():
    return {
        "message": "Outbreak Prediction API",
        "status": "operational",
        "timestamp": datetime.utcnow()
    }

@app.post("/camps/register")
async def register_camp(camp: CampLocation) -> Dict[str, str]:
    try:
        camp_id = await db_handler.register_camp(camp.dict())
        return {"status": "success", "camp_id": camp_id}
    except Exception as e:
        logger.error(f"Camp registration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/camps")
async def get_camps() -> List[Dict[str, Any]]:
    try:
        camps = await db_handler.get_all_camps()
        return camps
    except Exception as e:
        logger.error(f"Failed to fetch camps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/ingest")
async def trigger_data_ingestion(background_tasks: BackgroundTasks) -> Dict[str, str]:
    try:
        background_tasks.add_task(ingestion_service.run_full_ingestion)
        return {"status": "started", "message": "Data ingestion running in background"}
    except Exception as e:
        logger.error(f"Data ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/risk-scores/{camp_id}")
async def get_risk_score(camp_id: str) -> OutbreakPrediction:
    try:
        recent_data = await db_handler.get_recent_data(camp_id, hours=24)
        features, feature_names = preprocessor.prepare_features(recent_data)
        prediction = await predictor.predict_outbreak_risk(camp_id, features, feature_names)
        await db_handler.save_prediction(prediction.dict())
        return prediction
    except Exception as e:
        logger.error(f"Risk score calculation failed for camp {camp_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/risk-scores")
async def get_all_risk_scores() -> List[OutbreakPrediction]:
    try:
        camps = await db_handler.get_all_camps()
        predictions = []
        for camp in camps:
            try:
                recent_data = await db_handler.get_recent_data(camp['camp_id'], hours=24)
                features, feature_names = preprocessor.prepare_features(recent_data)
                prediction = await predictor.predict_outbreak_risk(camp['camp_id'], features, feature_names)
                predictions.append(prediction)
            except Exception as e:
                logger.error(f"Failed to get prediction for camp {camp['camp_id']}: {e}")
        return predictions
    except Exception as e:
        logger.error(f"Failed to get all risk scores: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/alerts/send")
async def send_alert(alert: AlertRequest) -> Dict[str, Any]:
    try:
        success = await notification_service.send_outbreak_alert(alert)
        return {
            "status": "success" if success else "failed",
            "alert_sent": success,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Alert sending failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": "connected",
            "ml_models": "loaded",
            "api": "operational"
        }
    }

@app.get("/dashboard/data/{camp_id}")
async def get_dashboard_data(camp_id: str, hours: int = 24) -> Dict[str, Any]:
    try:
        recent_data = await db_handler.get_recent_data(camp_id, hours)
        features, feature_names = preprocessor.prepare_features(recent_data)
        prediction = await predictor.predict_outbreak_risk(camp_id, features, feature_names)
        return {
            "camp_id": camp_id,
            "prediction": prediction.dict(),
            "raw_data": {
                "weather_records": len(recent_data.get('weather', [])),
                "social_records": len(recent_data.get('social_media', [])),
                "health_records": len(recent_data.get('health_indicators', []))
            },
            "last_updated": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Dashboard data fetch failed for camp {camp_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------------
# Scheduler runner
# ----------------------------
def run_scheduler():
    scheduler.start_scheduler()

def signal_handler(signum, frame):
    logger.info("Received shutdown signal, stopping services...")
    scheduler.stop_scheduler()
    sys.exit(0)

# ----------------------------
# Main entry point
# ----------------------------
if __name__ == "__main__":
    # Register signals
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Start scheduler in background thread
    Thread(target=run_scheduler, daemon=True).start()

    # Start FastAPI server
    logger.info(f"Starting Outbreak Prediction API on {settings.API_HOST}:{settings.API_PORT}")
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT, reload=False)
