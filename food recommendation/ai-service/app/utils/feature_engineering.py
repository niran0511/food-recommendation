import numpy as np
from typing import Dict, List, Any
from app.schemas.models import UserProfile, FoodItem
from app.services.health_calculator import calculate_bmi

# Constant features for encoding
ALLERGIES = ['Peanut', 'Gluten', 'Lactose', 'Seafood', 'Soy', 'Egg', 'Tree Nut']
DISEASES = ['Diabetes', 'Hypertension', 'High Cholesterol', 'Heart Disease', 'Kidney Disease', 
            'Liver Disease', 'Thyroid', 'PCOS', 'Obesity', 'Underweight', 'Anemia']
DIET_TYPES = ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Vegetarian']
CUISINES = ['Indian', 'Chinese', 'Italian', 'Mediterranean', 'Mexican', 'Japanese', 'Thai', 'American', 'Continental']
GOALS = ['Weight Loss', 'Weight Gain', 'Muscle Gain', 'Fat Loss', 'Maintain Weight', 'Healthy Eating']
ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete']
CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage', 'Dessert']

def encode_user_features(user: UserProfile) -> np.ndarray:
    features = []
    
    # 1. Age (normalized to roughly 0-1 range for 10-100)
    features.append(user.age / 100.0)
    
    # 2. BMI
    bmi = calculate_bmi(user.weight, user.height)
    features.append(min(bmi / 50.0, 1.0))
    
    # 3. Gender (Binary: 1 for Male, 0 for Female/Other)
    features.append(1.0 if user.gender.lower() == 'male' else 0.0)
    
    # 4. Activity Level (One-hot)
    for act in ACTIVITY_LEVELS:
        features.append(1.0 if act == user.activity_level else 0.0)
        
    # 5. Goal (One-hot)
    for g in GOALS:
        features.append(1.0 if g == user.goal else 0.0)
        
    # 6. Diet Type (One-hot)
    for dt in DIET_TYPES:
        features.append(1.0 if dt == user.diet_type else 0.0)
        
    # 7. Diseases (Multi-hot)
    for d in DISEASES:
        features.append(1.0 if d in user.diseases else 0.0)
        
    # 8. Allergies (Multi-hot)
    for a in ALLERGIES:
        features.append(1.0 if a in user.allergies else 0.0)
        
    return np.array(features, dtype=np.float32)

def encode_food_features(food: Dict) -> np.ndarray:
    # Handle both Dict (from JSON) and FoodItem
    if isinstance(food, FoodItem):
        f = food.model_dump()
    else:
        f = food
        
    features = []
    
    # Normalize nutritional values (heuristics for max daily values to scale to ~0-1)
    features.append(min(f.get('calories', 0) / 1000.0, 1.0))
    features.append(min(f.get('protein', 0) / 100.0, 1.0))
    features.append(min(f.get('carbohydrates', 0) / 150.0, 1.0))
    features.append(min(f.get('fat', 0) / 100.0, 1.0))
    features.append(min(f.get('fiber', 0) / 30.0, 1.0))
    features.append(min(f.get('sugar', 0) / 50.0, 1.0))
    features.append(min(f.get('sodium', 0) / 2000.0, 1.0))
    
    # Category (One-hot)
    for cat in CATEGORIES:
        features.append(1.0 if cat == f.get('category') else 0.0)
        
    # Cuisine (One-hot)
    for cuis in CUISINES:
        features.append(1.0 if cuis == f.get('cuisine') else 0.0)
        
    # Diet Types (Multi-hot)
    for dt in DIET_TYPES:
        features.append(1.0 if dt in f.get('diet_type', []) else 0.0)
        
    return np.array(features, dtype=np.float32)

def create_interaction_features(user_features: np.ndarray, food_features: np.ndarray) -> np.ndarray:
    # Concatenate both sets of features
    return np.concatenate([user_features, food_features])
