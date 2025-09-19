from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

# Load model
model = joblib.load("outbreak_model.pkl")

app = FastAPI()

# Define input schema
class CampData(BaseModel):
    population_size: int
    population_density_per_sqkm: int
    attack_rate_percent: float
    case_fatality_rate_percent: float
    duration_days: int
    sanitation_score: int
    vaccination_coverage_percent: float
    malnutrition_prevalence_percent: float
    overcrowding_index: float
    temperature_avg: int
    rainfall_mm: int
    healthcare_facilities: int
    medical_staff_ratio: float
    isolation_capacity: int
    response_time_hours: int

@app.post("/predict-risk")
def predict_risk(data: CampData):
    df = pd.DataFrame([data.dict()])
    pred = model.predict(df)[0]
    risk_label = "High Risk" if pred == 1 else "Low Risk"
    return {"risk": risk_label}
