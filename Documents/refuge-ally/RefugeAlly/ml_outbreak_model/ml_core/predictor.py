import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
import logging
from models.schemas import OutbreakPrediction, RiskLevel
from config.settings import settings

logger = logging.getLogger(__name__)

class OutbreakPredictor:
    def __init__(self, model_loader):
        self.model_loader = model_loader
        self.disease_patterns = {
            'cholera': {
                'temp_range': (25, 35),
                'humidity_min': 70,
                'symptoms': ['diarrhea', 'vomiting'],
                'seasonal_risk': [6, 7, 8, 9, 10]  # months
            },
            'dengue': {
                'temp_range': (20, 30),
                'humidity_min': 60,
                'symptoms': ['fever', 'headache'],
                'seasonal_risk': [4, 5, 6, 7, 8]
            },
            'respiratory': {
                'temp_range': (10, 25),
                'humidity_max': 40,
                'symptoms': ['cough', 'fever'],
                'seasonal_risk': [11, 12, 1, 2, 3]
            }
        }
    
    async def predict_outbreak_risk(self, camp_id: str, features: np.ndarray, feature_names: List[str]) -> OutbreakPrediction:
        """Generate outbreak prediction for a camp"""
        try:
            if features.size == 0:
                return self._create_low_risk_prediction(camp_id)
            
            # Get risk score using ensemble approach
            risk_score = await self._calculate_risk_score(features, feature_names)
            
            # Determine risk level
            risk_level = self._get_risk_level(risk_score)
            
            # Identify most likely disease
            predicted_disease, confidence = await self._predict_disease_type(features, feature_names)
            
            # Calculate contributing factors
            contributing_factors = self._analyze_contributing_factors(features, feature_names)
            
            return OutbreakPrediction(
                camp_id=camp_id,
                risk_score=risk_score,
                risk_level=risk_level,
                predicted_disease=predicted_disease,
                confidence=confidence,
                contributing_factors=contributing_factors,
                timestamp=datetime.utcnow(),
                expires_at=datetime.utcnow() + timedelta(hours=6)
            )
            
        except Exception as e:
            logger.error(f"Prediction error for camp {camp_id}: {e}")
            return self._create_low_risk_prediction(camp_id)
    
    async def _calculate_risk_score(self, features: np.ndarray, feature_names: List[str]) -> float:
        """Calculate overall risk score"""
        try:
            # Use multiple approaches to calculate risk
            
            # 1. Rule-based scoring
            rule_score = self._rule_based_scoring(features, feature_names)
            
            # 2. ML model scoring (if available and trained)
            ml_score = 0.5  # Default neutral score
            classifier = self.model_loader.get_model('outbreak_classifier')
            if classifier and hasattr(classifier, 'predict_proba'):
                try:
                    # For untrained models, this will likely fail, so we catch it
                    probabilities = classifier.predict_proba(features.reshape(1, -1))
                    if len(probabilities[0]) > 1:
                        ml_score = probabilities[0][1]  # Probability of positive class
                except:
                    pass
            
            # 3. Pattern matching score
            pattern_score = self._pattern_matching_score(features, feature_names)
            
            # Ensemble the scores
            final_score = (0.4 * rule_score + 0.3 * ml_score + 0.3 * pattern_score)
            
            return max(0.0, min(1.0, final_score))
            
        except Exception as e:
            logger.error(f"Risk calculation error: {e}")
            return 0.3  # Default low-medium risk
    
    def _rule_based_scoring(self, features: np.ndarray, feature_names: List[str]) -> float:
        """Calculate risk based on predefined rules"""
        score = 0.0
        
        try:
            feature_dict = dict(zip(feature_names, features[0]))
            
            # Temperature risk
            temp_avg = feature_dict.get('temp_avg', 20)
            if 25 <= temp_avg <= 35:
                score += 0.2
            
            # Humidity risk
            humidity_avg = feature_dict.get('humidity_avg', 50)
            if humidity_avg > 70:
                score += 0.2
            
            # Social media signals
            social_volume = feature_dict.get('social_volume', 0)
            if social_volume > 10:
                score += 0.2
                
            negative_sentiment = feature_dict.get('negative_sentiment_ratio', 0)
            if negative_sentiment > 0.3:
                score += 0.15
            
            # Health indicators
            total_cases = feature_dict.get('total_cases', 0)
            if total_cases > 5:
                score += 0.25
                
            fever_mentions = feature_dict.get('fever_mentions', 0)
            if fever_mentions > 3:
                score += 0.15
            
            return min(1.0, score)
            
        except Exception as e:
            logger.error(f"Rule-based scoring error: {e}")
            return 0.3
    
    def _pattern_matching_score(self, features: np.ndarray, feature_names: List[str]) -> float:
        """Score based on disease pattern matching"""
        try:
            feature_dict = dict(zip(feature_names, features[0]))
            max_pattern_score = 0.0
            
            current_month = datetime.now().month
            
            for disease, pattern in self.disease_patterns.items():
                pattern_score = 0.0
                
                # Temperature pattern
                temp_avg = feature_dict.get('temp_avg', 20)
                temp_min, temp_max = pattern['temp_range']
                if temp_min <= temp_avg <= temp_max:
                    pattern_score += 0.3
                
                # Humidity pattern
                humidity_avg = feature_dict.get('humidity_avg', 50)
                if 'humidity_min' in pattern and humidity_avg >= pattern['humidity_min']:
                    pattern_score += 0.2
                if 'humidity_max' in pattern and humidity_avg <= pattern['humidity_max']:
                    pattern_score += 0.2
                
                # Seasonal pattern
                if current_month in pattern['seasonal_risk']:
                    pattern_score += 0.2
                
                # Symptom pattern (simplified check)
                fever_mentions = feature_dict.get('fever_mentions', 0)
                if 'fever' in pattern['symptoms'] and fever_mentions > 0:
                    pattern_score += 0.3
                
                max_pattern_score = max(max_pattern_score, pattern_score)
            
            return min(1.0, max_pattern_score)
            
        except Exception as e:
            logger.error(f"Pattern matching error: {e}")
            return 0.3
    
    async def _predict_disease_type(self, features: np.ndarray, feature_names: List[str]) -> Tuple[str, float]:
        """Predict the most likely disease type"""
        try:
            feature_dict = dict(zip(feature_names, features[0]))
            
            disease_scores = {}
            current_month = datetime.now().month
            
            for disease, pattern in self.disease_patterns.items():
                score = 0.0
                
                # Environmental factors
                temp_avg = feature_dict.get('temp_avg', 20)
                humidity_avg = feature_dict.get('humidity_avg', 50)
                
                temp_min, temp_max = pattern['temp_range']
                if temp_min <= temp_avg <= temp_max:
                    score += 0.4
                
                if 'humidity_min' in pattern and humidity_avg >= pattern['humidity_min']:
                    score += 0.2
                if 'humidity_max' in pattern and humidity_avg <= pattern['humidity_max']:
                    score += 0.2
                
                # Seasonal factor
                if current_month in pattern['seasonal_risk']:
                    score += 0.2
                
                disease_scores[disease] = score
            
            if not disease_scores:
                return None, 0.5
            
            best_disease = max(disease_scores, key=disease_scores.get)
            confidence = disease_scores[best_disease]
            
            return best_disease if confidence > 0.3 else None, confidence
            
        except Exception as e:
            logger.error(f"Disease prediction error: {e}")
            return None, 0.5
    
    def _analyze_contributing_factors(self, features: np.ndarray, feature_names: List[str]) -> Dict[str, float]:
        """Analyze which factors contribute most to the risk"""
        try:
            feature_dict = dict(zip(feature_names, features[0]))
            factors = {}
            
            # Weather factors
            temp_avg = feature_dict.get('temp_avg', 20)
            humidity_avg = feature_dict.get('humidity_avg', 50)
            
            if 25 <= temp_avg <= 35:
                factors['high_temperature'] = min(1.0, (temp_avg - 20) / 15)
            if humidity_avg > 70:
                factors['high_humidity'] = min(1.0, (humidity_avg - 70) / 30)
                
            # Social factors
            social_volume = feature_dict.get('social_volume', 0)
            if social_volume > 0:
                factors['social_media_chatter'] = min(1.0, social_volume / 20)
                
            negative_sentiment = feature_dict.get('negative_sentiment_ratio', 0)
            if negative_sentiment > 0:
                factors['negative_sentiment'] = negative_sentiment
                
            # Health factors
            total_cases = feature_dict.get('total_cases', 0)
            if total_cases > 0:
                factors['reported_cases'] = min(1.0, total_cases / 10)
                
            fever_mentions = feature_dict.get('fever_mentions', 0)
            if fever_mentions > 0:
                factors['fever_reports'] = min(1.0, fever_mentions / 5)
                
            return factors
            
        except Exception as e:
            logger.error(f"Contributing factors analysis error: {e}")
            return {}
    
    def _get_risk_level(self, risk_score: float) -> RiskLevel:
        """Convert risk score to risk level"""
        if risk_score >= settings.RISK_THRESHOLD_HIGH:
            return RiskLevel.HIGH
        elif risk_score >= settings.RISK_THRESHOLD_MEDIUM:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def _create_low_risk_prediction(self, camp_id: str) -> OutbreakPrediction:
        """Create a default low-risk prediction"""
        return OutbreakPrediction(
            camp_id=camp_id,
            risk_score=0.1,
            risk_level=RiskLevel.LOW,
            predicted_disease=None,
            confidence=0.9,
            contributing_factors={},
            timestamp=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(hours=6)
        )