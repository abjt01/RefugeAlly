
from twilio.rest import Client
import logging
from typing import List
from config.settings import settings
from models.schemas import AlertRequest, RiskLevel

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        if all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN]):
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            self.from_number = settings.TWILIO_FROM_NUMBER
        else:
            self.client = None
            logger.warning("Twilio credentials not configured")
    
    async def send_outbreak_alert(self, alert: AlertRequest) -> bool:
        """Send outbreak alert via SMS"""
        if not self.client or not self.from_number:
            logger.warning("Cannot send SMS - Twilio not configured")
            return False
            
        try:
            success_count = 0
            
            for recipient in alert.recipients:
                try:
                    message = self.client.messages.create(
                        body=f"🚨 OUTBREAK ALERT - {alert.severity.upper()}\n\n"
                             f"Camp: {alert.camp_id}\n"
                             f"Message: {alert.message}\n\n"
                             f"Please take immediate action.",
                        from_=self.from_number,
                        to=recipient
                    )
                    success_count += 1
                    logger.info(f"Alert sent to {recipient}: {message.sid}")
                    
                except Exception as e:
                    logger.error(f"Failed to send SMS to {recipient}: {e}")
            
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Notification service error: {e}")
            return False
    
    def format_alert_message(self, camp_id: str, risk_score: float, 
                           predicted_disease: str, factors: dict) -> str:
        """Format alert message for notifications"""
        message = f"High risk detected in camp {camp_id}. "
        message += f"Risk Score: {risk_score:.2f}. "
        
        if predicted_disease:
            message += f"Potential disease: {predicted_disease}. "
            
        if factors:
            top_factors = sorted(factors.items(), key=lambda x: x[1], reverse=True)[:2]
            factor_text = ", ".join([f"{factor}: {value:.2f}" for factor, value in top_factors])
            message += f"Key factors: {factor_text}. "
            
        message += "Immediate investigation recommended."
        return message