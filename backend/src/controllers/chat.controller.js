const axios = require('axios');
const Message = require('../models/Message');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            throw new ApiError(400, "Receiver ID and message content are required");
        }

        const message = await Message.create({
            senderId,
            receiverId,
            content
        });

        res.status(201).json(new ApiResponse(210, { message }, "Message sent successfully"));
    } catch (error) {
        next(error);
    }
};

exports.getChatHistory = async (req, res, next) => {
    try {
        const myId = req.user.id;
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        // Fetch messages between current user and specified user
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userId },
                { senderId: userId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        // Mark incoming messages as read
        await Message.updateMany(
            { senderId: userId, receiverId: myId, isRead: false },
            { isRead: true }
        );

        res.status(200).json(new ApiResponse(200, { messages }, "Chat history retrieved"));
    } catch (error) {
        next(error);
    }
};

exports.getAIChatbotResponse = async (req, res, next) => {
    try {
        const { message } = req.body;
        const user = req.user;
        const profile = user.profile;

        if (!message) {
            throw new ApiError(400, "Message content is required");
        }

        // Prepare UserProfile payload matching FastAPI Pydantic schema
        const hasProfile = profile && profile.age && profile.height && profile.weight;
        const payload = {
            message,
            user: hasProfile ? {
                age: profile.age || 30,
                gender: profile.gender || 'Other',
                height: profile.height || 170,
                weight: profile.weight || 70,
                activity_level: profile.activityLevel || 'Lightly Active',
                goal: profile.goal || 'Healthy Eating',
                diseases: profile.diseases || [],
                allergies: profile.allergies || [],
                diet_type: profile.dietType || 'Non-Vegetarian',
                cuisine_preference: profile.cuisinePreference || [],
                budget: profile.budget || 'Medium',
                meal_frequency: profile.mealFrequency || 3,
                deficiencies: profile.deficiencies || []
            } : null
        };

        const aiUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
        
        try {
            console.log("Chatbot Proxy Payload:", JSON.stringify(payload, null, 2));
            const aiRes = await axios.post(`${aiUrl}/api/chat`, payload);
            return res.status(200).json(new ApiResponse(200, { response: aiRes.data.response }, "Chat response retrieved successfully"));
        } catch (aiErr) {
            console.warn("⚠️ AI Service Chatbot Error, falling back to local rule-based response engine:", aiErr.message);
            
            const messageLower = message.toLowerCase().trim();

            if (/\b(hi|hello|hey|greetings|yo)\b/.test(messageLower)) {
                const firstName = user.name ? user.name.split(' ')[0] : 'there';
                return res.status(200).json(new ApiResponse(200, { response: `Hello ${firstName}! 👋 I am your NutriAI Nutrition Assistant. How can I help you with your meals, health targets, or diet today?` }));
            }

            if (messageLower.includes('calorie') || messageLower.includes('kcal')) {
                if (hasProfile) {
                    const weight = profile.weight;
                    const height = profile.height;
                    const age = profile.age;
                    const gender = profile.gender || 'Other';
                    let bmr = 0;
                    if (gender.toLowerCase() === 'male') {
                        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
                    } else {
                        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
                    }
                    const multipliers = {
                        "Sedentary": 1.2,
                        "Lightly Active": 1.375,
                        "Moderately Active": 1.55,
                        "Very Active": 1.725,
                        "Athlete": 1.9
                    };
                    const multiplier = multipliers[profile.activityLevel] || 1.2;
                    const tdee = bmr * multiplier;
                    let calories = tdee;
                    if (profile.goal === 'Weight Loss' || profile.goal === 'Fat Loss') {
                        calories = tdee - 500;
                    } else if (profile.goal === 'Weight Gain' || profile.goal === 'Muscle Gain') {
                        calories = tdee + 500;
                    }
                    return res.status(200).json(new ApiResponse(200, { response: `Based on your profile, your daily caloric target is **${Math.round(calories)} kcal** to support your goal of **${profile.goal}**. Let me know if you would like me to suggest a specific meal plan fitting this budget!` }));
                }
                return res.status(200).json(new ApiResponse(200, { response: "Your daily caloric needs depend on your age, weight, height, and activity level. If you complete your profile, I can calculate your exact target. Generally, a typical adult needs 2000-2500 kcal per day." }));
            }

            if (['protein', 'carb', 'fat', 'macro'].some(macro => messageLower.includes(macro))) {
                if (hasProfile) {
                    const weight = profile.weight;
                    const height = profile.height;
                    const age = profile.age;
                    const gender = profile.gender || 'Other';
                    let bmr = 0;
                    if (gender.toLowerCase() === 'male') {
                        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
                    } else {
                        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
                    }
                    const multipliers = {
                        "Sedentary": 1.2,
                        "Lightly Active": 1.375,
                        "Moderately Active": 1.55,
                        "Very Active": 1.725,
                        "Athlete": 1.9
                    };
                    const multiplier = multipliers[profile.activityLevel] || 1.2;
                    const tdee = bmr * multiplier;
                    let calories = tdee;
                    let pRatio = 0.3, cRatio = 0.4, fRatio = 0.3;
                    if (profile.goal === 'Weight Loss' || profile.goal === 'Fat Loss') {
                        calories = tdee - 500;
                        pRatio = 0.4; cRatio = 0.3; fRatio = 0.3;
                    } else if (profile.goal === 'Weight Gain' || profile.goal === 'Muscle Gain') {
                        calories = tdee + 500;
                        pRatio = 0.3; cRatio = 0.5; fRatio = 0.2;
                    }
                    const protein = (calories * pRatio) / 4;
                    const carbs = (calories * cRatio) / 4;
                    const fat = (calories * fRatio) / 9;
                    
                    return res.status(200).json(new ApiResponse(200, { response: `Your customized macronutrient targets for **${profile.goal}** are:\n• 🥩 **Protein**: ${Math.round(protein)}g\n• 🍞 **Carbohydrates**: ${Math.round(carbs)}g\n• 🥑 **Fats**: ${Math.round(fat)}g\n• 🌾 **Fiber**: 30g` }));
                }
                return res.status(200).json(new ApiResponse(200, { response: "Macronutrients consist of Proteins (4 kcal/g), Carbohydrates (4 kcal/g), and Fats (9 kcal/g). A standard balanced split is 30% Protein, 40% Carbs, and 30% Fats, but this can be customized for your goals." }));
            }

            if (messageLower.includes('diabet') || messageLower.includes('sugar')) {
                let response = "For managing diabetes, it is recommended to focus on foods with a **low Glycemic Index (GI)**. Avoid refined grains, sugary sodas, and excess sweets. Include fiber-rich foods like leafy greens, lentils, oats, and healthy fats (nuts, seeds, olive oil).";
                if (hasProfile && profile.diseases && profile.diseases.some(d => d.toLowerCase().includes('diabet'))) {
                    response = "Since you have **Diabetes** registered in your profile, we have automatically boosted low-glycemic foods in your recommendations. Avoid simple carbs and focus on high-protein, high-fiber meals.";
                }
                return res.status(200).json(new ApiResponse(200, { response }));
            }

            if (['hypertension', 'blood pressure', 'bp', 'sodium', 'salt'].some(k => messageLower.includes(k))) {
                let response = "To manage blood pressure, focus on the **DASH diet** (Dietary Approaches to Stop Hypertension). Reduce your sodium intake to under 1500–2300 mg per day. Eat foods rich in potassium, calcium, and magnesium, such as bananas, leafy greens, yogurt, and berries.";
                if (hasProfile && profile.diseases && profile.diseases.some(d => d.toLowerCase().includes('hyper') || d.toLowerCase().includes('tension') || d.toLowerCase().includes('heart'))) {
                    response = "Since **Hypertension/Heart Disease** is flagged in your health profile, we have filtered out high-sodium foods. Focus on heart-healthy fats, fruits, and vegetables.";
                }
                return res.status(200).json(new ApiResponse(200, { response }));
            }

            if (messageLower.includes('water') || messageLower.includes('drink') || messageLower.includes('hydrat')) {
                if (hasProfile && profile.weight) {
                    const water = profile.weight * 0.035;
                    return res.status(200).json(new ApiResponse(200, { response: `To stay perfectly hydrated, you should aim to drink at least **${water.toFixed(1)} Liters** of water daily. Staying hydrated boosts energy, aids digestion, and keeps your metabolism active.` }));
                }
                return res.status(200).json(new ApiResponse(200, { response: "It is recommended to drink between 2.5 to 3.5 Liters of water daily, depending on your body weight and activity level." }));
            }

            if (messageLower.includes('meal plan') || messageLower.includes('what should i eat')) {
                if (hasProfile) {
                    return res.status(200).json(new ApiResponse(200, { response: "I can build a balanced daily or weekly meal plan for you! Head over to the **Meal Planner** tab on the sidebar to see a customized Breakfast, Lunch, Dinner, and Snack schedule adjusted to your macros." }));
                }
                return res.status(200).json(new ApiResponse(200, { response: "Head to your profile to set up your health details, and I can build a daily or weekly meal plan for you." }));
            }

            if (messageLower.includes('weight loss') || messageLower.includes('fat loss') || messageLower.includes('diet')) {
                if (hasProfile && (profile.goal === 'Weight Loss' || profile.goal === 'Fat Loss')) {
                     return res.status(200).json(new ApiResponse(200, { response: `Your profile goal is set to **${profile.goal}**. I have calculated a caloric deficit for you. Try focusing on lean proteins (to preserve muscle) and high-fiber foods to stay full.` }));
                }
                return res.status(200).json(new ApiResponse(200, { response: "For weight loss, a sustainable caloric deficit of 300-500 calories below your maintenance level is recommended, combined with high-protein intake and strength training." }));
            }

            return res.status(200).json(new ApiResponse(200, {
                response: "That's an interesting question! As your AI nutrition assistant, I recommend focusing on a balanced whole-foods diet. Make sure to complete your onboarding profile so I can customize my nutritional advice for your body weight, health goals, and medical conditions!"
            }, "Fallback response complete"));
        }
    } catch (error) {
        next(error);
    }
};

