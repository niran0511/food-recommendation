from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from contextlib import asynccontextmanager

from app.schemas.models import (
    UserProfile, RecommendationResponse, MealPlanResponse, WeeklyPlanResponse,
    HealthMetrics, HealthRiskResponse, NutritionAnalysis, ChatRequest, ChatResponse
)
from app.services.health_calculator import get_health_metrics
from app.services.recommendation_engine import get_recommendations, get_foods_to_avoid, load_data_and_models
from app.services.meal_planner import generate_meal_plan, generate_weekly_plan
from app.services.health_risk_predictor import predict_health_risks
from app.services.deficiency_detector import detect_deficiencies
from app.services.chatbot import get_chatbot_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models and data at startup
    load_data_and_models()
    yield

app = FastAPI(title="AI Food Recommendation Service", lifespan=lifespan)

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/recommend", response_model=List[RecommendationResponse])
def recommend(user: UserProfile):
    try:
        return get_recommendations(user, top_n=10)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend/avoid", response_model=List[RecommendationResponse])
def recommend_avoid(user: UserProfile):
    try:
        return get_foods_to_avoid(user, top_n=5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/meal-plan", response_model=MealPlanResponse)
def meal_plan(user: UserProfile):
    try:
        return generate_meal_plan(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/weekly-plan", response_model=WeeklyPlanResponse)
def weekly_plan(user: UserProfile):
    try:
        return generate_weekly_plan(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/health-risk", response_model=HealthRiskResponse)
def health_risk(user: UserProfile):
    try:
        return predict_health_risks(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/deficiency-detect")
def deficiency_detect(user: UserProfile):
    try:
        return detect_deficiencies(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/health-metrics", response_model=HealthMetrics)
def health_metrics(user: UserProfile):
    try:
        return get_health_metrics(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        return get_chatbot_response(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
