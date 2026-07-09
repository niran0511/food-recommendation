from typing import List, Dict, Any
import random
from app.schemas.models import UserProfile, RecommendationResponse, MealPlanResponse, WeeklyPlanResponse
from app.services.health_calculator import get_health_metrics
from app.services.recommendation_engine import get_recommendations

def generate_meal_plan(user: UserProfile, recommendations: List[RecommendationResponse] = None) -> MealPlanResponse:
    if not recommendations:
        recommendations = get_recommendations(user, top_n=30)
        
    if not recommendations:
        # Fallback if DB empty
        return MealPlanResponse(breakfast=[], lunch=[], dinner=[], snacks=[], 
                                total_calories=0, total_protein=0, total_carbs=0, total_fat=0)
                                
    # Group recommendations by meal type
    breakfast_foods = [r for r in recommendations if 'Breakfast' in r.meal_type or r.category == 'Breakfast']
    lunch_foods = [r for r in recommendations if 'Lunch' in r.meal_type or r.category == 'Lunch']
    dinner_foods = [r for r in recommendations if 'Dinner' in r.meal_type or r.category == 'Dinner']
    snack_foods = [r for r in recommendations if 'Snack' in r.meal_type or r.category == 'Snack']
    
    # If any is empty, just borrow from others for now
    if not breakfast_foods: breakfast_foods = recommendations[:2]
    if not lunch_foods: lunch_foods = recommendations[2:5]
    if not dinner_foods: dinner_foods = recommendations[5:8]
    if not snack_foods: snack_foods = recommendations[8:10]
    
    # Pick a random sensible combination
    b_pick = random.sample(breakfast_foods, min(2, len(breakfast_foods)))
    l_pick = random.sample(lunch_foods, min(2, len(lunch_foods)))
    d_pick = random.sample(dinner_foods, min(2, len(dinner_foods)))
    s_pick = random.sample(snack_foods, min(1, len(snack_foods)))
    
    all_picks = b_pick + l_pick + d_pick + s_pick
    
    t_cal = sum(f.calories for f in all_picks)
    t_pro = sum(f.protein for f in all_picks)
    t_car = sum(f.carbohydrates for f in all_picks)
    t_fat = sum(f.fat for f in all_picks)
    
    return MealPlanResponse(
        breakfast=b_pick,
        lunch=l_pick,
        dinner=d_pick,
        snacks=s_pick,
        total_calories=round(t_cal, 1),
        total_protein=round(t_pro, 1),
        total_carbs=round(t_car, 1),
        total_fat=round(t_fat, 1)
    )

def generate_weekly_plan(user: UserProfile) -> WeeklyPlanResponse:
    # Get a large pool of recommendations
    pool = get_recommendations(user, top_n=50)
    
    days = []
    for _ in range(7):
        days.append(generate_meal_plan(user, pool))
        
    return WeeklyPlanResponse(
        monday=days[0],
        tuesday=days[1],
        wednesday=days[2],
        thursday=days[3],
        friday=days[4],
        saturday=days[5],
        sunday=days[6]
    )
