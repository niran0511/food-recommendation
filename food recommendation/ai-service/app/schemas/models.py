from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class UserProfile(BaseModel):
    age: int = Field(ge=10, le=100)
    gender: str
    height: float
    weight: float
    activity_level: str
    goal: str
    diseases: List[str] = []
    allergies: List[str] = []
    diet_type: str
    cuisine_preference: List[str] = []
    budget: str = "Medium"
    meal_frequency: int = 3
    deficiencies: List[str] = []

class FoodItem(BaseModel):
    name: str
    image: str
    category: str
    cuisine: str
    calories: float
    protein: float
    carbohydrates: float
    fat: float
    fiber: float
    sugar: float
    sodium: float
    potassium: float
    calcium: float
    iron: float
    vitamin_a: float
    vitamin_b: float
    vitamin_c: float
    vitamin_d: float
    vitamin_e: float
    cholesterol: float
    omega_3: float
    ingredients: List[str]
    allergens: List[str]
    cooking_time: int
    difficulty: str
    price: str
    rating: float
    meal_type: List[str]
    suitable_for: List[str]
    avoid_for: List[str]
    diet_type: List[str]

class RecommendationResponse(BaseModel):
    food: str
    image: str
    category: str
    cuisine: str
    score: float
    calories: float
    protein: float
    carbohydrates: float
    fat: float
    fiber: float
    reasons_for: List[str]
    reasons_against: List[str]
    meal_type: List[str]

class MealPlanResponse(BaseModel):
    breakfast: List[RecommendationResponse]
    lunch: List[RecommendationResponse]
    dinner: List[RecommendationResponse]
    snacks: List[RecommendationResponse]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float

class WeeklyPlanResponse(BaseModel):
    monday: MealPlanResponse
    tuesday: MealPlanResponse
    wednesday: MealPlanResponse
    thursday: MealPlanResponse
    friday: MealPlanResponse
    saturday: MealPlanResponse
    sunday: MealPlanResponse

class HealthMetrics(BaseModel):
    bmi: float
    bmi_category: str
    bmr: float
    tdee: float
    daily_calories: float
    daily_protein: float
    daily_carbs: float
    daily_fat: float
    daily_fiber: float
    water_intake: float

class HealthRiskResponse(BaseModel):
    obesity_risk: float
    diabetes_risk: float
    hypertension_risk: float
    heart_disease_risk: float
    overall_health_score: float
    risk_factors: List[str]
    recommendations: List[str]

class NutritionAnalysis(BaseModel):
    current_intake: dict
    recommended_intake: dict
    deficiencies: List[dict]
    excesses: List[dict]
    score: float

class ChatRequest(BaseModel):
    message: str
    user: Optional[UserProfile] = None

class ChatResponse(BaseModel):
    response: str
