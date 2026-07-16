from app.schemas.models import ChatRequest, ChatResponse
import re
import os
import urllib.request
import json

# Initialize Gemini if API key is provided
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_model = None

if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        print("Gemini API Client successfully initialized for Chatbot.")
    except Exception as e:
        print(f"Failed to initialize Gemini API Client: {e}")

def call_openai_compatible_api(url: str, api_key: str, model: str, prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        return res_data["choices"][0]["message"]["content"]

def get_chatbot_response(request: ChatRequest) -> ChatResponse:
    message = request.message
    user = request.user

    # Build context about the user's health profile
    user_context = ""
    if user:
        diseases_str = ", ".join(user.diseases) if user.diseases else "None"
        allergies_str = ", ".join(user.allergies) if user.allergies else "None"
        cuisine_str = ", ".join(user.cuisine_preference) if user.cuisine_preference else "No preference"
        deficiencies_str = ", ".join(user.deficiencies) if user.deficiencies else "None"
        user_context = f"""
        You are talking to a user with the following health profile:
        - Age: {user.age}
        - Gender: {user.gender}
        - Height: {user.height} cm
        - Weight: {user.weight} kg
        - Activity Level: {user.activity_level}
        - Goal: {user.goal}
        - Diet Type: {user.diet_type}
        - Diseases/Conditions: {diseases_str}
        - Allergies: {allergies_str}
        - Deficiencies: {deficiencies_str}
        - Preferred Cuisines: {cuisine_str}
        - Budget Category: {user.budget}
        """

    system_instruction = f"""
    You are NutriAI, a medical-grade, highly encouraging and empathetic AI Nutritionist and Health Assistant.
    Your goal is to answer user questions about clinical nutrition, meal planning, calorie intake, workouts, and diet.
    {user_context}
    
    Guidelines:
    - Keep your responses concise (no more than 3 paragraphs or a few bullet points).
    - Use bullet points and bold text where appropriate to make information easy to read.
    - Provide clear, scientifically-backed, and practical health recommendations.
    - If the user asks about foods to eat or avoid, cross-reference their diseases and allergies.
    - Do not prescribe medical treatments or diagnoses. Always focus on lifestyle, diet, and nutrition.
    """

    prompt = f"{system_instruction}\n\nUser Question: {message}\n\nAI Response:"

    # 1. Try Gemini
    if gemini_model:
        try:
            response = gemini_model.generate_content(prompt)
            return ChatResponse(response=response.text.strip())
        except Exception as e:
            print(f"Gemini API invocation error: {e}. Trying other models.")

    # 2. Try Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if GROQ_API_KEY:
        try:
            content = call_openai_compatible_api(
                "https://api.groq.com/openai/v1/chat/completions",
                GROQ_API_KEY,
                "llama3-8b-8192",
                prompt
            )
            return ChatResponse(response=content.strip())
        except Exception as e:
            print(f"Groq API invocation error: {e}. Trying other models.")

    # 3. Try OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if OPENAI_API_KEY:
        try:
            content = call_openai_compatible_api(
                "https://api.openai.com/v1/chat/completions",
                OPENAI_API_KEY,
                "gpt-4o-mini",
                prompt
            )
            return ChatResponse(response=content.strip())
        except Exception as e:
            print(f"OpenAI API invocation error: {e}. Falling back to rule-based engine.")

    # Fallback to local rule-based matching if Gemini is not set up or fails
    message_lower = message.lower().strip()
    
    # 1. Greetings
    if re.search(r'\b(hi|hello|hey|greetings|yo)\b', message_lower):

        name = " there"
        if user and hasattr(user, 'name') and user.name:
            name = f" {user.name.split()[0]}"
        return ChatResponse(response=f"Hello{name}! 👋 I am your NutriAI Nutrition Assistant. How can I help you with your meals, health targets, or diet today?")
        
    # 2. Calories / Energy Query

    if 'calorie' in message_lower or 'kcal' in message_lower:

        if user:
            from app.services.health_calculator import get_health_metrics
            metrics = get_health_metrics(user)
            calories = round(metrics.daily_calories)
            return ChatResponse(response=f"Based on your profile, your daily caloric target is **{calories} kcal** to support your goal of **{user.goal}**. Let me know if you would like me to suggest a specific meal plan fitting this budget!")
        return ChatResponse(response="Your daily caloric needs depend on your age, weight, height, and activity level. If you complete your profile, I can calculate your exact target. Generally, a typical adult needs 2000-2500 kcal per day.")

    # 3. Protein / Macronutrients

    if any(macro in message_lower for macro in ['protein', 'carb', 'fat', 'macro']):

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

    if 'diabet' in message_lower or 'sugar' in message_lower:

        response = "For managing diabetes, it is recommended to focus on foods with a **low Glycemic Index (GI)**. Avoid refined grains, sugary sodas, and excess sweets. Include fiber-rich foods like leafy greens, lentils, oats, and healthy fats (nuts, seeds, olive oil)."
        if user and 'diabetes' in [d.lower() for d in user.diseases]:
            response = "Since you have **Diabetes** registered in your profile, we have automatically boosted low-glycemic foods in your recommendations. Avoid simple carbs and focus on high-protein, high-fiber meals."
        return ChatResponse(response=response)

    # 5. Blood Pressure / Hypertension / Sodium

    if any(k in message_lower for k in ['hypertension', 'blood pressure', 'bp', 'sodium', 'salt']):

        response = "To manage blood pressure, focus on the **DASH diet** (Dietary Approaches to Stop Hypertension). Reduce your sodium intake to under 1500–2300 mg per day. Eat foods rich in potassium, calcium, and magnesium, such as bananas, leafy greens, yogurt, and berries."
        if user and any(h in [d.lower() for d in user.diseases] for h in ['hypertension', 'heart disease']):
            response = "Since **Hypertension/Heart Disease** is flagged in your health profile, we have filtered out high-sodium foods. Focus on heart-healthy fats, fruits, and vegetables."
        return ChatResponse(response=response)

    # 6. Water / Hydration

    if 'water' in message_lower or 'drink' in message_lower or 'hydrat' in message_lower:

        if user:
            from app.services.health_calculator import get_health_metrics
            metrics = get_health_metrics(user)
            return ChatResponse(response=f"To stay perfectly hydrated, you should aim to drink at least **{metrics.water_intake:.1f} Liters** of water daily. Staying hydrated boosts energy, aids digestion, and keeps your metabolism active.")
        return ChatResponse(response="It is recommended to drink between 2.5 to 3.5 Liters of water daily, depending on your body weight and activity level.")

    # 7. Meal Planner

    if 'meal plan' in message_lower or 'what should i eat' in message_lower:

        if user:
            return ChatResponse(response="I can build a balanced daily or weekly meal plan for you! Head over to the **Meal Plan** tab on the navigation bar to see a customized Breakfast, Lunch, Dinner, and Snack schedule adjusted to your macros.")
        return ChatResponse(response="Head to your profile to set up your health details, and I can build a daily or weekly meal plan for you.")

    # 8. Weight Loss / Fat Loss

    if 'weight loss' in message_lower or 'fat loss' in message_lower or 'diet' in message_lower:

        if user and user.goal in ['Weight Loss', 'Fat Loss']:
            return ChatResponse(response=f"Your profile goal is set to **{user.goal}**. I have calculated a caloric deficit for you. Try focusing on lean proteins (to preserve muscle) and high-fiber foods to stay full.")
        return ChatResponse(response="For weight loss, a sustainable caloric deficit of 300-500 calories below your maintenance level is recommended, combined with high-protein intake and strength training.")

    # Fallback response
    return ChatResponse(response=(
        "That's an interesting question! As your AI nutrition assistant, I recommend focusing on a balanced whole-foods diet. "
        "Make sure to complete your onboarding profile so I can customize my nutritional advice for your body weight, health goals, and medical conditions!"
    ))
