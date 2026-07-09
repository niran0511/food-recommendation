import json
import os
import numpy as np
import joblib
from typing import List, Dict, Any
from app.schemas.models import UserProfile, RecommendationResponse
from app.utils.feature_engineering import encode_user_features, encode_food_features, create_interaction_features

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "food_database.json")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "trained_models")

_food_db = None
_rf_model = None

def load_data_and_models():
    global _food_db, _rf_model
    if _food_db is None and os.path.exists(DATA_PATH):
        with open(DATA_PATH, 'r') as f:
            _food_db = json.load(f)
    
    rf_path = os.path.join(MODELS_DIR, "rf_recommendation.joblib")
    if _rf_model is None and os.path.exists(rf_path):
        _rf_model = joblib.load(rf_path)

def filter_foods(user: UserProfile, foods: List[Dict]) -> List[Dict]:
    filtered = []
    user_allergies = set(a.lower().strip() for a in user.allergies)
    user_diseases = set(d.lower().strip() for d in user.diseases)
    user_diet = user.diet_type.lower()
    
    for food in foods:
        # 1. Allergen check (strict check in allergens list)
        food_allergens = set(a.lower().strip() for a in food.get('allergens', []))
        if user_allergies.intersection(food_allergens):
            continue
            
        # 1.5. Ingredient and Name allergen check
        # This catches custom allergies like 'chicken', 'tomato', etc.
        food_ingredients = set(i.lower().strip() for i in food.get('ingredients', []))
        food_name = food.get('name', '').lower()
        
        has_custom_allergen = False
        for allergy in user_allergies:
            if not allergy or allergy == 'none':
                continue
            # Match ingredient directly or as substring (e.g. 'chicken breast' matches 'chicken')
            if any(allergy in ing for ing in food_ingredients) or allergy in food_name:
                has_custom_allergen = True
                break
        if has_custom_allergen:
            continue
            
        # 2. Disease avoidance check
        food_avoid = set(a.lower().strip() for a in food.get('avoid_for', []))
        if user_diseases.intersection(food_avoid):
            continue
            
        # 3. Diet type check (strict)
        if user_diet == 'vegan' and 'Vegan' not in food.get('diet_type', []):
            continue
        elif user_diet == 'vegetarian' and 'Non-Vegetarian' in food.get('diet_type', []):
            continue
            
        filtered.append(food)
        
    return filtered

def calculate_nutritional_score(user: UserProfile, food: Dict) -> float:
    score = 50.0 # Base score
    
    # 1. Calorie checks (rough estimate per meal, assume 3 meals)
    from app.services.health_calculator import get_health_metrics
    metrics = get_health_metrics(user)
    target_meal_calories = metrics.daily_calories / user.meal_frequency
    
    cal = food.get('calories', 0)
    if abs(cal - target_meal_calories) < 200:
        score += 15
    elif cal > target_meal_calories * 1.5:
        score -= 10
        
    # 2. Disease suitability
    user_diseases = set(d.lower() for d in user.diseases)
    food_suitable = set(s.lower() for s in food.get('suitable_for', []))
    if user_diseases.intersection(food_suitable):
        score += 20
        
    # 3. Cuisine match
    if food.get('cuisine') in user.cuisine_preference:
        score += 15
        
    return min(100.0, max(0.0, score))

def generate_reasons(user: UserProfile, food: Dict, score: float) -> tuple:
    reasons_for = []
    reasons_against = []
    
    # Good
    if score > 80:
        reasons_for.append("Excellent match for your health goals")
    
    if food.get('cuisine') in user.cuisine_preference:
        reasons_for.append(f"Matches your preference for {food.get('cuisine')} food")
        
    if food.get('protein', 0) > 20:
        reasons_for.append("High in protein")
        
    if food.get('fiber', 0) > 5:
        reasons_for.append("Good source of fiber")
        
    user_diseases = set(d.lower() for d in user.diseases)
    food_suitable = set(s.lower() for s in food.get('suitable_for', []))
    matched = user_diseases.intersection(food_suitable)
    if matched:
        reasons_for.append(f"Suitable for managing {', '.join(matched).title()}")
        
    # Bad
    if food.get('sugar', 0) > 15 and 'diabetes' in user_diseases:
        reasons_against.append("Relatively high in sugar for diabetes")
        
    if food.get('sodium', 0) > 600 and 'hypertension' in user_diseases:
        reasons_against.append("High sodium content")
        
    return reasons_for, reasons_against

def get_recommendations(user: UserProfile, top_n: int = 10) -> List[RecommendationResponse]:
    load_data_and_models()
    
    if not _food_db:
        return []
        
    # 1. Hard filtering
    valid_foods = filter_foods(user, _food_db)
    if not valid_foods:
        return []
        
    # 2. ML Scoring + Heuristic Scoring
    scored_foods = []
    user_features = encode_user_features(user)
    
    for food in valid_foods:
        # Heuristic score (0-1)
        n_score = calculate_nutritional_score(user, food) / 100.0
        
        # ML Score if model exists
        ml_score = 0.5
        if _rf_model:
            try:
                food_feat = encode_food_features(food)
                inter_feat = create_interaction_features(user_features, food_feat).reshape(1, -1)
                ml_score = _rf_model.predict_proba(inter_feat)[0][1] # Probability of class 1 (suitable)
            except Exception:
                pass
                
        # Final Score (Simple TOPSIS stand-in: weighted average)
        final_score = (ml_score * 0.4) + (n_score * 0.6)
        scored_foods.append((food, final_score))
        
    # 3. Sort and format
    scored_foods.sort(key=lambda x: x[1], reverse=True)
    top_foods = scored_foods[:top_n]
    
    results = []
    for food, score in top_foods:
        score_100 = round(score * 100, 1)
        r_for, r_against = generate_reasons(user, food, score_100)
        
        results.append(RecommendationResponse(
            food=food.get('name', 'Unknown'),
            image=food.get('image', ''),
            category=food.get('category', 'Generic'),
            cuisine=food.get('cuisine', 'Generic'),
            score=score_100,
            calories=food.get('calories', 0),
            protein=food.get('protein', 0),
            carbohydrates=food.get('carbohydrates', 0),
            fat=food.get('fat', 0),
            fiber=food.get('fiber', 0),
            reasons_for=r_for,
            reasons_against=r_against,
            meal_type=food.get('meal_type', [])
        ))
        
    return results

def get_foods_to_avoid(user: UserProfile, top_n: int = 5) -> List[RecommendationResponse]:
    load_data_and_models()
    if not _food_db: return []
    
    bad_foods = []
    user_diseases = set(d.lower().strip() for d in user.diseases)
    user_allergies = set(a.lower().strip() for a in user.allergies)
    
    for food in _food_db:
        # Check disease conflicts
        food_avoid = set(a.lower().strip() for a in food.get('avoid_for', []))
        disease_overlap = user_diseases.intersection(food_avoid)
        
        # Check allergy conflicts
        food_allergens = set(a.lower().strip() for a in food.get('allergens', []))
        allergy_overlap = user_allergies.intersection(food_allergens)
        
        # Custom allergen ingredient check
        food_ingredients = set(i.lower().strip() for i in food.get('ingredients', []))
        food_name = food.get('name', '').lower()
        
        has_allergen_ingredient = False
        allergen_reasons = []
        for allergy in user_allergies:
            if not allergy or allergy == 'none':
                continue
            if any(allergy in ing for ing in food_ingredients) or allergy in food_name:
                has_allergen_ingredient = True
                allergen_reasons.append(f"Contains allergen: {allergy.title()}")
                
        if disease_overlap or allergy_overlap or has_allergen_ingredient:
            reasons = []
            if disease_overlap:
                reasons.append(f"Not recommended for {', '.join(disease_overlap).title()}")
            if allergy_overlap:
                reasons.append(f"Contains allergen: {', '.join(allergy_overlap).title()}")
            reasons.extend(allergen_reasons)
            
            if food.get('sugar', 0) > 20: reasons.append("High sugar content")
            if food.get('sodium', 0) > 800: reasons.append("Very high sodium")
            if food.get('fat', 0) > 30: reasons.append("High in fat")
            
            # Ensure unique warnings
            reasons = list(set(reasons))
            
            score_factor = len(disease_overlap) + len(allergy_overlap) + (1 if has_allergen_ingredient else 0) + food.get('calories', 0)/1000
            bad_foods.append((food, score_factor, reasons))
            
    bad_foods.sort(key=lambda x: x[1], reverse=True)
    
    results = []
    for food, _, reasons in bad_foods[:top_n]:
        results.append(RecommendationResponse(
            food=food.get('name', 'Unknown'),
            image=food.get('image', ''),
            category=food.get('category', 'Generic'),
            cuisine=food.get('cuisine', 'Generic'),
            score=20.0,
            calories=food.get('calories', 0),
            protein=food.get('protein', 0),
            carbohydrates=food.get('carbohydrates', 0),
            fat=food.get('fat', 0),
            fiber=food.get('fiber', 0),
            reasons_for=[],
            reasons_against=reasons,
            meal_type=food.get('meal_type', [])
        ))
    return results
