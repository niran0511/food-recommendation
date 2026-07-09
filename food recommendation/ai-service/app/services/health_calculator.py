from app.schemas.models import UserProfile, HealthMetrics

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 2)

def get_bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 25:
        return "Normal"
    elif 25 <= bmi < 30:
        return "Overweight"
    else:
        return "Obese"

def calculate_bmr(weight: float, height: float, age: int, gender: str) -> float:
    if gender.lower() == "male":
        return round((10 * weight) + (6.25 * height) - (5 * age) + 5, 2)
    else:
        return round((10 * weight) + (6.25 * height) - (5 * age) - 161, 2)

def calculate_tdee(bmr: float, activity_level: str) -> float:
    multipliers = {
        "Sedentary": 1.2,
        "Lightly Active": 1.375,
        "Moderately Active": 1.55,
        "Very Active": 1.725,
        "Athlete": 1.9
    }
    return round(bmr * multipliers.get(activity_level, 1.2), 2)

def calculate_daily_macros(tdee: float, goal: str) -> dict:
    if goal == "Weight Loss" or goal == "Fat Loss":
        calories = tdee - 500
        protein_ratio = 0.4
        carbs_ratio = 0.3
        fat_ratio = 0.3
    elif goal == "Weight Gain" or goal == "Muscle Gain":
        calories = tdee + 500
        protein_ratio = 0.3
        carbs_ratio = 0.5
        fat_ratio = 0.2
    else:  # Maintain Weight, Healthy Eating
        calories = tdee
        protein_ratio = 0.3
        carbs_ratio = 0.4
        fat_ratio = 0.3
    
    return {
        "calories": round(calories, 2),
        "protein_g": round((calories * protein_ratio) / 4, 2),
        "carbs_g": round((calories * carbs_ratio) / 4, 2),
        "fat_g": round((calories * fat_ratio) / 9, 2),
        "fiber_g": 30.0  # basic target
    }

def calculate_water_intake(weight: float) -> float:
    # Basic formula: 35ml per kg of body weight
    return round(weight * 0.035, 2)

def get_health_metrics(user: UserProfile) -> HealthMetrics:
    bmi = calculate_bmi(user.weight, user.height)
    bmi_category = get_bmi_category(bmi)
    bmr = calculate_bmr(user.weight, user.height, user.age, user.gender)
    tdee = calculate_tdee(bmr, user.activity_level)
    macros = calculate_daily_macros(tdee, user.goal)
    water = calculate_water_intake(user.weight)
    
    return HealthMetrics(
        bmi=bmi,
        bmi_category=bmi_category,
        bmr=bmr,
        tdee=tdee,
        daily_calories=macros["calories"],
        daily_protein=macros["protein_g"],
        daily_carbs=macros["carbs_g"],
        daily_fat=macros["fat_g"],
        daily_fiber=macros["fiber_g"],
        water_intake=water
    )
