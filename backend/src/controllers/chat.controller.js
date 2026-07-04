const axios = require('axios');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

exports.sendChatMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        const user = req.user;

        // Prepare request body for AI service, supplying user profile context if it exists
        const payload = {
            message,
            user: user.profile && user.profile.age ? {
                age: user.profile.age,
                gender: user.profile.gender,
                height: user.profile.height,
                weight: user.profile.weight,
                activity_level: user.profile.activityLevel,
                goal: user.profile.goal,
                diet_type: user.profile.dietType,
                diseases: user.profile.diseases || [],
                allergies: user.profile.allergies || [],
                cuisine_preference: user.profile.cuisinePreference || [],
                deficiencies: user.profile.deficiencies || []
            } : null
        };

        const aiUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
        const response = await axios.post(`${aiUrl}/api/chat`, payload);

        res.status(200).json(new ApiResponse(200, response.data, 'Success'));
    } catch (error) {
        console.warn("⚠️ AI Service Error in sendChatMessage, generating fallback response locally:", error.message);
        try {
            const Food = require('../models/Food');
            const userMsg = message.toLowerCase();
            let reply = "";

            if (userMsg.includes('food') || userMsg.includes('eat') || userMsg.includes('recipe') || 
                userMsg.includes('suggest') || userMsg.includes('recommend') || userMsg.includes('breakfast') || 
                userMsg.includes('lunch') || userMsg.includes('dinner') || userMsg.includes('snack')) {
                
                // Formulate query based on profile
                const matchQuery = {};
                if (user.profile) {
                    if (user.profile.dietType === 'Vegan') {
                        matchQuery.diet_type = 'Vegan';
                    } else if (user.profile.dietType === 'Vegetarian') {
                        matchQuery.diet_type = { $in: ['Vegetarian', 'Vegan'] };
                    }
                    
                    if (user.profile.diseases && user.profile.diseases.length > 0) {
                        matchQuery.avoid_for = { $nin: user.profile.diseases };
                    }
                    
                    if (user.profile.allergies && user.profile.allergies.length > 0) {
                        const allergyRegexes = user.profile.allergies
                            .filter(a => a && a.toLowerCase() !== 'none')
                            .map(a => new RegExp(a.trim(), 'i'));
                        
                        if (allergyRegexes.length > 0) {
                            matchQuery.name = { $nin: allergyRegexes };
                            matchQuery.ingredients = { $nin: allergyRegexes };
                        }
                    }
                }

                // Query 3 random foods
                const sampleFoods = await Food.aggregate([
                    { $match: matchQuery },
                    { $sample: { size: 3 } }
                ]);

                if (sampleFoods.length > 0) {
                    reply = `Hello! The AI Nutrition Model is currently sleeping, but here are some healthy foods from our database matching your ${user.profile?.dietType || 'Non-Vegetarian'} profile:\n\n` +
                        sampleFoods.map(f => `• **${f.name}** (${Math.round(f.calories)} kcal) - ${f.cuisine} style, containing ${Math.round(f.protein)}g protein.`).join('\n') +
                        `\n\nTo view their full recipes, you can visit the **Food Recommendation** page!`;
                } else {
                    reply = `Hello! The AI Nutrition Model is currently offline. Based on your profile, I recommend focusing on whole, unprocessed foods. Let me know if you have specific nutrient goals!`;
                }
            } else {
                reply = `Hi ${user.name || 'there'}! The AI Nutrition Engine is currently sleeping, but I can see you are aiming for **${user.profile?.goal || 'Weight Loss'}** with a **${user.profile?.dietType || 'Non-Vegetarian'}** diet. Let me know if you would like me to suggest some recipes or healthy foods!`;
            }

            res.status(200).json(new ApiResponse(200, {
                response: reply
            }, 'Success'));
        } catch (dbError) {
            console.error("Database fallback error in sendChatMessage:", dbError.message);
            next(new ApiError(500, 'AI Nutrition assistant is temporarily unavailable'));
        }
    }
};
