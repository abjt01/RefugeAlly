
import asyncio
import schedule
import time
import threading
import logging
from datetime import datetime
from services.ingestion_service import IngestionService
from services.db_handler import DatabaseHandler
from ml_core.model_loader import ModelLoader
from ml_core.predictor import OutbreakPredictor
from services.data_preprocessor import DataPreprocessor
from services.notification_service import NotificationService
from models.schemas import AlertRequest, RiskLevel

logger = logging.getLogger(__name__)

class TaskScheduler:
    def __init__(self):
        self.ingestion_service = IngestionService()
        self.db_handler = DatabaseHandler()
        self.model_loader = ModelLoader()
        self.predictor = OutbreakPredictor(self.model_loader)
        self.preprocessor = DataPreprocessor()
        self.notification_service = NotificationService()
        self.is_running = False
        
    def start_scheduler(self):
        """Start the background scheduler"""
        if self.is_running:
            return
            
        self.is_running = True
        
        # Schedule data ingestion every hour
        schedule.every().hour.do(self._run_data_ingestion)
        
        # Schedule risk assessment every 30 minutes
        schedule.every(30).minutes.do(self._run_risk_assessment)
        
        # Schedule model updates daily
        schedule.every().day.at("02:00").do(self._update_models)
        
        # Start scheduler thread
        scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
        scheduler_thread.start()
        
        logger.info("Task scheduler started")
    
    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
                time.sleep(60)
    
    def _run_data_ingestion(self):
        """Background task for data ingestion"""
        try:
            asyncio.run(self._async_data_ingestion())
            logger.info("Scheduled data ingestion completed")
        except Exception as e:
            logger.error(f"Scheduled data ingestion failed: {e}")
    
    async def _async_data_ingestion(self):
        """Async data ingestion task"""
        response = await self.ingestion_service.run_full_ingestion()
        logger.info(f"Ingestion result: {response.status}, records: {response.records_processed}")
    
    def _run_risk_assessment(self):
        """Background task for risk assessment"""
        try:
            asyncio.run(self._async_risk_assessment())
            logger.info("Scheduled risk assessment completed")
        except Exception as e:
            logger.error(f"Scheduled risk assessment failed: {e}")
    
    async def _async_risk_assessment(self):
        """Async risk assessment task"""
        camps = await self.db_handler.get_all_camps()
        high_risk_camps = []
        
        for camp in camps:
            try:
                # Get recent data and generate prediction
                recent_data = await self.db_handler.get_recent_data(camp['camp_id'], hours=6)
                features, feature_names = self.preprocessor.prepare_features(recent_data)
                prediction = await self.predictor.predict_outbreak_risk(
                    camp['camp_id'], features, feature_names
                )
                
                # Save prediction
                await self.db_handler.save_prediction(prediction.dict())
                
                # Check if high risk and needs alert
                if prediction.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
                    high_risk_camps.append((camp, prediction))
                    
            except Exception as e:
                logger.error(f"Risk assessment failed for camp {camp['camp_id']}: {e}")
        
        # Send alerts for high-risk camps
        for camp, prediction in high_risk_camps:
            await self._send_high_risk_alert(camp, prediction)
    
    async def _send_high_risk_alert(self, camp, prediction):
        """Send alert for high-risk camp"""
        try:
            message = self.notification_service.format_alert_message(
                camp['camp_id'],
                prediction.risk_score,
                prediction.predicted_disease,
                prediction.contributing_factors
            )
            
            # For demo purposes, using placeholder recipients
            # In production, this would come from a database of emergency contacts
            alert = AlertRequest(
                camp_id=camp['camp_id'],
                message=message,
                severity=prediction.risk_level,
                recipients=["+1234567890"]  # Placeholder
            )
            
            await self.notification_service.send_outbreak_alert(alert)
            logger.info(f"High risk alert sent for camp {camp['camp_id']}")
            
        except Exception as e:
            logger.error(f"Failed to send high risk alert for camp {camp['camp_id']}: {e}")
    
    def _update_models(self):
        """Background task for model updates"""
        try:
            # In production, this would retrain models with new data
            self.model_loader.save_models()
            logger.info("Model update completed")
        except Exception as e:
            logger.error(f"Model update failed: {e}")
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        self.is_running = False
        schedule.clear()
        logger.info("Task scheduler stopped")

# Global scheduler instance
scheduler = TaskScheduler()
