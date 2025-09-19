import time
import logging
from typing import Dict, List, Any
from datetime import datetime, timedelta
from functools import wraps
from collections import defaultdict

logger = logging.getLogger(__name__)

class MetricsCollector:
    """Collects and tracks system performance metrics"""
    
    def __init__(self):
        self.metrics = defaultdict(list)
        self.counters = defaultdict(int)
        self.timers = {}
        
    def record_api_call(self, endpoint: str, duration: float, status: str):
        """Record API call metrics"""
        self.metrics['api_calls'].append({
            'endpoint': endpoint,
            'duration': duration,
            'status': status,
            'timestamp': datetime.utcnow()
        })
        self.counters[f"api_calls_{endpoint}"] += 1
        self.counters[f"api_status_{status}"] += 1
    
    def record_prediction_accuracy(self, camp_id: str, predicted_risk: float, actual_outcome: bool):
        """Record prediction accuracy for model evaluation"""
        self.metrics['predictions'].append({
            'camp_id': camp_id,
            'predicted_risk': predicted_risk,
            'actual_outcome': actual_outcome,
            'timestamp': datetime.utcnow()
        })
    
    def record_data_ingestion(self, source: str, records_count: int, duration: float):
        """Record data ingestion metrics"""
        self.metrics['ingestion'].append({
            'source': source,
            'records_count': records_count,
            'duration': duration,
            'timestamp': datetime.utcnow()
        })
        self.counters[f"ingestion_{source}_records"] += records_count
    
    def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary for the last N hours"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        # API performance
        recent_api_calls = [m for m in self.metrics['api_calls'] if m['timestamp'] > cutoff]
        avg_response_time = sum(m['duration'] for m in recent_api_calls) / len(recent_api_calls) if recent_api_calls else 0
        
        # Data ingestion performance
        recent_ingestion = [m for m in self.metrics['ingestion'] if m['timestamp'] > cutoff]
        total_records_ingested = sum(m['records_count'] for m in recent_ingestion)
        
        return {
            'period_hours': hours,
            'api_performance': {
                'total_calls': len(recent_api_calls),
                'average_response_time': avg_response_time,
                'success_rate': len([m for m in recent_api_calls if m['status'] == 'success']) / len(recent_api_calls) if recent_api_calls else 0
            },
            'data_ingestion': {
                'total_records': total_records_ingested,
                'ingestion_runs': len(recent_ingestion)
            },
            'predictions': {
                'total_predictions': len([m for m in self.metrics['predictions'] if m['timestamp'] > cutoff])
            }
        }

# Global metrics collector
metrics_collector = MetricsCollector()

def track_performance(endpoint_name: str):
    """Decorator to track API endpoint performance"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                metrics_collector.record_api_call(endpoint_name, duration, 'success')
                return result
            except Exception as e:
                duration = time.time() - start_time
                metrics_collector.record_api_call(endpoint_name, duration, 'error')
                raise
        return wrapper
    return decorator