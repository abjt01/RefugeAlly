import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import DBSCAN, KMeans
from typing import Dict, Any, Optional
import logging
import os

logger = logging.getLogger(__name__)

class ModelLoader:
    def __init__(self):
        self.models = {}
        self.model_path = "saved_models/"
        os.makedirs(self.model_path, exist_ok=True)
        
    def load_models(self):
        """Load all ML models"""
        try:
            # Try to load existing models
            model_files = {
                'outbreak_classifier': 'outbreak_rf_model.pkl',
                'risk_regressor': 'risk_regression_model.pkl',
                'geo_clusterer': 'geo_cluster_model.pkl'
            }
            
            for model_name, filename in model_files.items():
                filepath = os.path.join(self.model_path, filename)
                if os.path.exists(filepath):
                    self.models[model_name] = joblib.load(filepath)
                    logger.info(f"Loaded {model_name} from {filename}")
                else:
                    # Create default models if files don't exist
                    self.models[model_name] = self._create_default_model(model_name)
                    logger.info(f"Created default {model_name}")
                    
        except Exception as e:
            logger.error(f"Model loading error: {e}")
            self._create_default_models()
    
    def _create_default_model(self, model_name: str):
        """Create default models when saved models aren't available"""
        if model_name == 'outbreak_classifier':
            return RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        elif model_name == 'risk_regressor':
            return RandomForestClassifier(
                n_estimators=50,
                max_depth=8,
                random_state=42
            )
        elif model_name == 'geo_clusterer':
            return DBSCAN(eps=0.5, min_samples=5)
        else:
            return None
    
    def _create_default_models(self):
        """Create all default models"""
        self.models = {
            'outbreak_classifier': self._create_default_model('outbreak_classifier'),
            'risk_regressor': self._create_default_model('risk_regressor'),
            'geo_clusterer': self._create_default_model('geo_clusterer')
        }
    
    def get_model(self, model_name: str):
        """Get a specific model"""
        return self.models.get(model_name)
    
    def save_models(self):
        """Save all models to disk"""
        try:
            for model_name, model in self.models.items():
                filename = f"{model_name}.pkl"
                filepath = os.path.join(self.model_path, filename)
                joblib.dump(model, filepath)
            logger.info("All models saved successfully")
        except Exception as e:
            logger.error(f"Model saving error: {e}")
