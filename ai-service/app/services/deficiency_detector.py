from typing import List, Dict, Any
import random
from app.schemas.models import UserProfile
from app.services.recommendation_engine import get_recommendations

NUTRIENT_MAP = {
    'Iron': 'iron',
    'Vitamin D': 'vitamin_d',
    'Vitamin B12': 'vitamin_b', # simplified
    'Vitamin C': 'vitamin_c',
    'Calcium': 'calcium',
    'Potassium': 'potassium',
    'Omega-3': 'omega_3',
    'Fiber': 'fiber'
}

def detect_deficiencies(user: UserProfile) -> List[Dict]:
    deficiencies = list(user.deficiencies)
    
    # Add assumed deficiencies based on diseases/diet
    if user.diet_type == 'Vegan' and 'Vitamin B12' not in deficiencies:
        deficiencies.append('Vitamin B12')
    if 'Anemia' in user.diseases and 'Iron' not in deficiencies:
        deficiencies.append('Iron')
        
    if not deficiencies:
        return []
        
    results = []
    pool = get_recommendations(user, top_n=100)
    
    for defic in deficiencies:
        nutrient_key = NUTRIENT_MAP.get(defic)
        if not nutrient_key: continue
        
        # Sort pool by that nutrient
        sorted_pool = sorted(pool, key=lambda x: getattr(x, nutrient_key, 0) if hasattr(x, nutrient_key) else x.model_dump().get(nutrient_key, 0), reverse=True)
        
        top_foods = sorted_pool[:5]
        food_suggestions = [{"name": f.food, "image": f.image} for f in top_foods]
        
        results.append({
            "nutrient": defic,
            "current_intake": "Low", # Simplified
            "recommended_intake": "Standard RDA",
            "gap_percentage": 50.0, # Placeholder
            "suggested_foods": food_suggestions
        })
        
    return results
