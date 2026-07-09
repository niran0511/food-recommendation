import json
import random
import os

def generate_foods():
    categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage', 'Dessert']
    cuisines = ['Indian', 'Chinese', 'Italian', 'Mediterranean', 'Mexican', 'Japanese', 'Thai', 'American', 'Continental']
    diet_types = ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Vegetarian']
    
    base_foods = [
        {"name": "Oatmeal with Berries", "category": "Breakfast", "cuisine": "American", "diet": ["Vegetarian", "Vegan"]},
        {"name": "Grilled Salmon", "category": "Dinner", "cuisine": "American", "diet": ["Non-Vegetarian"]},
        {"name": "Quinoa Salad", "category": "Lunch", "cuisine": "Mediterranean", "diet": ["Vegetarian", "Vegan"]},
        {"name": "Chicken Tikka Masala", "category": "Dinner", "cuisine": "Indian", "diet": ["Non-Vegetarian"]},
        {"name": "Dal Tadka", "category": "Lunch", "cuisine": "Indian", "diet": ["Vegetarian", "Vegan"]},
        {"name": "Greek Yogurt", "category": "Snack", "cuisine": "Mediterranean", "diet": ["Vegetarian"]},
        {"name": "Avocado Toast", "category": "Breakfast", "cuisine": "American", "diet": ["Vegetarian", "Vegan"]},
        {"name": "Sushi Roll", "category": "Lunch", "cuisine": "Japanese", "diet": ["Non-Vegetarian"]},
        {"name": "Tofu Stir Fry", "category": "Dinner", "cuisine": "Chinese", "diet": ["Vegetarian", "Vegan"]},
        {"name": "Pasta Primavera", "category": "Dinner", "cuisine": "Italian", "diet": ["Vegetarian"]},
        {"name": "Beef Tacos", "category": "Lunch", "cuisine": "Mexican", "diet": ["Non-Vegetarian"]}
    ]
    
    foods = []
    
    for i in range(100): # Generate 100 sample items to seed the DB
        base = random.choice(base_foods)
        f = {
            "name": f"{base['name']} Variant {i}",
            "image": f"https://via.placeholder.com/300x200?text={base['name'].replace(' ', '+')}",
            "category": base['category'],
            "cuisine": base['cuisine'],
            "calories": random.uniform(100, 800),
            "protein": random.uniform(5, 50),
            "carbohydrates": random.uniform(10, 100),
            "fat": random.uniform(2, 40),
            "fiber": random.uniform(1, 15),
            "sugar": random.uniform(1, 30),
            "sodium": random.uniform(50, 1500),
            "potassium": random.uniform(100, 1000),
            "calcium": random.uniform(20, 500),
            "iron": random.uniform(1, 15),
            "vitamin_a": random.uniform(0, 1000),
            "vitamin_b": random.uniform(0, 10),
            "vitamin_c": random.uniform(0, 100),
            "vitamin_d": random.uniform(0, 10),
            "vitamin_e": random.uniform(0, 10),
            "cholesterol": random.uniform(0, 100) if 'Vegan' not in base['diet'] else 0,
            "omega_3": random.uniform(0, 2),
            "ingredients": ["Ingredient A", "Ingredient B", "Ingredient C"],
            "allergens": random.sample(['Peanut', 'Gluten', 'Lactose', 'Seafood', 'Soy', 'Egg', 'Tree Nut'], random.randint(0, 2)),
            "cooking_time": random.randint(5, 60),
            "difficulty": random.choice(["Easy", "Medium", "Hard"]),
            "price": random.choice(["Low", "Medium", "High"]),
            "rating": random.uniform(3.5, 5.0),
            "meal_type": [base['category']],
            "suitable_for": random.sample(['Diabetes', 'Hypertension', 'High Cholesterol', 'Heart Disease', 'Kidney Disease', 'Obesity'], random.randint(1, 3)),
            "avoid_for": random.sample(['Diabetes', 'Hypertension', 'High Cholesterol', 'Heart Disease', 'Kidney Disease'], random.randint(0, 2)),
            "diet_type": base['diet']
        }
        foods.append(f)
        
    os.makedirs(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'app', 'data'), exist_ok=True)
    with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'app', 'data', 'food_database.json'), 'w') as f:
        json.dump(foods, f, indent=2)
        
    print(f"Generated {len(foods)} food items")

if __name__ == "__main__":
    generate_foods()
