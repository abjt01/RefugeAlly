import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

from services.data_preprocessor import DataPreprocessor
from ml_core.predictor import OutbreakPredictor
from utils.data_validator import DataValidator
from models.schemas import CampLocation, RiskLevel

class TestDataPreprocessor:
    """Test data preprocessing functionality"""
    
    def test_weather_feature_extraction(self):
        preprocessor = DataPreprocessor()
        
        weather_data = [
            {'temperature': 30, 'humidity': 80, 'rainfall': 5, 'wind_speed': 10},
            {'temperature': 32, 'humidity': 85, 'rainfall': 0, 'wind_speed': 12}
        ]
        
        features, names = preprocessor._process_weather_data(weather_data)
        
        assert len(features) == 6
        assert 'temp_avg' in names
        assert 'humidity_avg' in names
        assert features[0] == 31.0  # Average temperature
        assert features[1] == 82.5  # Average humidity
    
    def test_social_media_feature_extraction(self):
        preprocessor = DataPreprocessor()
        
        social_data = [
            {'sentiment_score': -0.5, 'symptom_keywords': ['fever', 'headache']},
            {'sentiment_score': 0.2, 'symptom_keywords': ['cough']}
        ]
        
        features, names = preprocessor._process_social_media_data(social_data)
        
        assert len(features) == 5
        assert features[0] == 2  # Volume
        assert features[1] == -0.15  # Average sentiment
        assert features[3] == 3  # Symptom diversity (fever, headache, cough)

class TestOutbreakPredictor:
    """Test outbreak prediction functionality"""
    
    def test_risk_level_classification(self):
        mock_model_loader = Mock()
        predictor = OutbreakPredictor(mock_model_loader)
        
        # Test risk level thresholds
        assert predictor._get_risk_level(0.9) == RiskLevel.HIGH
        assert predictor._get_risk_level(0.6) == RiskLevel.MEDIUM
        assert predictor._get_risk_level(0.3) == RiskLevel.LOW
    
    def test_rule_based_scoring(self):
        mock_model_loader = Mock()
        predictor = OutbreakPredictor(mock_model_loader)
        
        # High-risk features
        features = [31, 75, 10, 8, 0.5, 0.3, 15, -0.4, 0.6, 5, 8, 10, 2.0, 5, 3]
        feature_names = [
            'temp_avg', 'humidity_avg', 'rainfall_sum', 'wind_avg', 'temp_var', 'humidity_var',
            'social_volume', 'sentiment_avg', 'negative_sentiment_ratio', 'symptom_diversity', 'fever_mentions',
            'total_cases', 'severity_avg', 'respiratory_cases', 'gi_cases'
        ]
        
        score = predictor._rule_based_scoring([features], feature_names)
        assert score > 0.5  # Should indicate elevated risk

class TestDataValidator:
    """Test data validation functionality"""
    
    def test_camp_data_validation(self):
        # Valid camp data
        valid_camp = {
            'camp_id': 'TEST001',
            'name': 'Test Camp',
            'latitude': 12.345,
            'longitude': -67.890,
            'population': 5000,
            'country': 'TG'
        }
        assert DataValidator.validate_camp_data(valid_camp) == True
        
        # Invalid coordinates
        invalid_camp = valid_camp.copy()
        invalid_camp['latitude'] = 91.0  # Out of range
        assert DataValidator.validate_camp_data(invalid_camp) == False
    
    def test_weather_data_validation(self):
        weather_data = [
            {
                'camp_id': 'TEST001',
                'temperature': 25,
                'humidity': 60,
                'rainfall': 0,
                'wind_speed': 5
            },
            {  # Invalid - missing fields
                'camp_id': 'TEST001',
                'temperature': 25
            },
            {  # Invalid - out of range humidity
                'camp_id': 'TEST001',
                'temperature': 25,
                'humidity': 150,
                'rainfall': 0,
                'wind_speed': 5
            }
        ]
        
        valid_records = DataValidator.validate_weather_data(weather_data)
        assert len(valid_records) == 1  # Only first record should be valid
