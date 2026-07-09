from app.schemas.models import ChatRequest, ChatResponse
import re

def get_chatbot_response(request: ChatRequest) -> ChatResponse:
    message = request.message.lower().strip()
    user = request.user
    
    # Base health details if user context is provided
    goal_info = f"your goal is set to {user.goal}" if user and user.goal else ""
    diet_info = f"you follow a {user.diet_type} diet" if user and user.diet_type else ""
    
    # 1. Greetings
    if re.search(r'\b(hi|hello|hey|greetings|yo)\b', message):
        name = " there"
        if user and hasattr(user, 'name') and user.name:
            name = f" {user.name.split()[0]}"
        return ChatResponse(response=f"Hello{name}! 👋 I am your NutriAI Nutrition Assistant. How can I help you with your meals, health targets, or diet today?")
        
    # 2. Calories / Energy Query
    if 'calorie' in message or 'kcal' in message:
        if user:
            from app.services.health_calculator import get_health_metrics
            metrics = get_health_metrics(user)
            calories = round(metrics.daily_calories)
            return ChatResponse(response=f"Based on your profile, your daily caloric target is **{calories} kcal** to support your goal of **{user.goal}**. Let me know if you would like me to suggest a specific meal plan fitting this budget!")
        return ChatResponse(response="Your daily caloric needs depend on your age, weight, height, and activity level. If you complete your profile, I can calculate your exact target. Generally, a typical adult needs 2000-2500 kcal per day.")

    # 3. Protein / Macronutrients
    if any(macro in message for macro in ['protein', 'carb', 'fat', 'macro']):
        if user:
            from app.services.health_calculator import get_health_metrics
            metrics = get_health_metrics(user)
            return ChatResponse(response=(
                f"Your customized macronutrient targets for **{user.goal}** are:\n"
                f"• 🥩 **Protein**: {round(metrics.daily_protein)}g\n"
                f"• 🍞 **Carbohydrates**: {round(metrics.daily_carbs)}g\n"
                f"• 🥑 **Fats**: {round(metrics.daily_fat)}g\n"
                f"• 🌾 **Fiber**: {round(metrics.daily_fiber)}g"
            ))
        return ChatResponse(response="Macronutrients consist of Proteins (4 kcal/g), Carbohydrates (4 kcal/g), and Fats (9 kcal/g). A standard balanced split is 30% Protein, 40% Carbs, and 30% Fats, but this can be customized for your goals.")

    # 4. Diabetes / Sugar
    if 'diabet' in message or 'sugar' in message:
        response = "For managing diabetes, it is recommended to focus on foods with a **low Glycemic Index (GI)**. Avoid refined grains, sugary sodas, and excess sweets. Include fiber-rich foods like leafy greens, lentils, oats, and healthy fats (nuts, seeds, olive oil)."
        if user and 'diabetes' in [d.lower() for d in user.diseases]:
            response = "Since you have **Diabetes** registered in your profile, we have automatically boosted low-glycemic foods in your recommendations. Avoid simple carbs and focus on high-protein, high-fiber meals."
        return ChatResponse(response=response)

    # 5. Blood Pressure / Hypertension / Sodium
    if any(k in message for k in ['hypertension', 'blood pressure', 'bp', 'sodium', 'salt']):
        response = "To manage blood pressure, focus on the **DASH diet** (Dietary Approaches to Stop Hypertension). Reduce your sodium intake to under 1500–2300 mg per day. Eat foods rich in potassium, calcium, and magnesium, such as bananas, leafy greens, yogurt, and berries."
        if user and any(h in [d.lower() for d in user.diseases] for h in ['hypertension', 'heart disease']):
            response = "Since **Hypertension/Heart Disease** is flagged in your health profile, we have filtered out high-sodium foods. Focus on heart-healthy fats, fruits, and vegetables."
        return ChatResponse(response=response)

    # 6. Water / Hydration
    if 'water' in message or 'drink' in message or 'hydrat' in message:
        if user:
            from app.services.health_calculator import get_health_metrics
            metrics = get_health_metrics(user)
            return ChatResponse(response=f"To stay perfectly hydrated, you should aim to drink at least **{metrics.water_intake:.1f} Liters** of water daily. Staying hydrated boosts energy, aids digestion, and keeps your metabolism active.")
        return ChatResponse(response="It is recommended to drink between 2.5 to 3.5 Liters of water daily, depending on your body weight and activity level.")

    # 7. Meal Planner
    if 'meal plan' in message or 'what should i eat' in message:
        if user:
            return ChatResponse(response="I can build a balanced daily or weekly meal plan for you! Head over to the **Meal Plan** tab on the navigation bar to see a customized Breakfast, Lunch, Dinner, and Snack schedule adjusted to your macros.")
        return ChatResponse(response="Head to your profile to set up your health details, and I can build a daily or weekly meal plan for you.")

    # 8. Weight Loss / Fat Loss
    if 'weight loss' in message or 'fat loss' in message or 'diet' in message:
        if user and user.goal in ['Weight Loss', 'Fat Loss']:
            return ChatResponse(response=f"Your profile goal is set to **{user.goal}**. I have calculated a caloric deficit for you. Try focusing on lean proteins (to preserve muscle) and high-fiber foods to stay full.")
        return ChatResponse(response="For weight loss, a sustainable caloric deficit of 300-500 calories below your maintenance level is recommended, combined with high-protein intake and strength training.")

    # Fallback response
    return ChatResponse(response=(
        "That's an interesting question! As your AI nutrition assistant, I recommend focusing on a balanced whole-foods diet. "
        "Make sure to complete your onboarding profile so I can customize my nutritional advice for your body weight, health goals, and medical conditions!"
    ))
