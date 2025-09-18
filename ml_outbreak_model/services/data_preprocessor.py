import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
import logging
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

class DataPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        
    def prepare_features(self, raw_data: Dict[str, List[Dict]]) -> Tuple[np.ndarray, List[str]]:
        """Convert raw data to ML features"""
        try:
            features = []
            feature_names = []
            
            # Weather features
            weather_features, weather_names = self._process_weather_data(raw_data.get('weather', []))
            features.extend(weather_features)
            feature_names.extend(weather_names)
            
            # Social media features
            social_features, social_names = self._process_social_media_data(raw_data.get('social_media', []))
            features.extend(social_features)
            feature_names.extend(social_names)
            
            # Health indicator features
            health_features, health_names = self._process_health_data(raw_data.get('health_indicators', []))
            features.extend(health_features)
            feature_names.extend(health_names)
            
            if not features:
                return np.array([]), []
                
            return np.array(features).reshape(1, -1), feature_names
            
        except Exception as e:
            logger.error(f"Feature preparation error: {e}")
            return np.array([]), []
    
    def _process_weather_data(self, weather_data: List[Dict]) -> Tuple[List[float], List[str]]:
        """Extract weather features"""
        if not weather_data:
            return [0, 0, 0, 0, 0, 0], ['temp_avg', 'humidity_avg', 'rainfall_sum', 'wind_avg', 'temp_var', 'humidity_var']
            
        df = pd.DataFrame(weather_data)
        
        features = [
            df['temperature'].mean(),
            df['humidity'].mean(),
            df['rainfall'].sum(),
            df['wind_speed'].mean(),
            df['temperature'].var(),
            df['humidity'].var()
        ]
        
        feature_names = ['temp_avg', 'humidity_avg', 'rainfall_sum', 'wind_avg', 'temp_var', 'humidity_var']
        
        return features, feature_names
    
    def _process_social_media_data(self, social_data: List[Dict]) -> Tuple[List[float], List[str]]:
        """Extract social media features"""
        if not social_data:
            return [0, 0, 0, 0, 0], ['social_volume', 'sentiment_avg', 'negative_sentiment_ratio', 'symptom_diversity', 'fever_mentions']
            
        df = pd.DataFrame(social_data)
        
        # Count symptom mentions
        all_symptoms = []
        fever_count = 0
        
        for symptoms in df['symptom_keywords']:
            all_symptoms.extend(symptoms)
            if 'fever' in symptoms:
                fever_count += 1
        
        features = [
            len(social_data),  # Volume
            df['sentiment_score'].mean(),  # Average sentiment
            (df['sentiment_score'] < -0.1).mean(),  # Negative sentiment ratio
            len(set(all_symptoms)),  # Symptom diversity
            fever_count  # Fever mentions
        ]
        
        feature_names = ['social_volume', 'sentiment_avg', 'negative_sentiment_ratio', 'symptom_diversity', 'fever_mentions']
        
        return features, feature_names
    
    def _process_health_data(self, health_data: List[Dict]) -> Tuple[List[float], List[str]]:
        """Extract health indicator features"""
        if not health_data:
            return [0, 0, 0, 0], ['total_cases', 'severity_avg', 'respiratory_cases', 'gi_cases']
            
        df = pd.DataFrame(health_data)
        
        features = [
            df['count'].sum(),  # Total cases
            df['severity'].mean(),  # Average severity
            df[df['indicator_type'].str.contains('respiratory', na=False)]['count'].sum(),  # Respiratory cases
            df[df['indicator_type'].str.contains('diarrhea|stomach', na=False)]['count'].sum()  # GI cases
        ]
        
        feature_names = ['total_cases', 'severity_avg', 'respiratory_cases', 'gi_cases']
        
        return features, feature_names