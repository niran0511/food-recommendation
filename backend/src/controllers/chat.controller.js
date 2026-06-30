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
        console.error("AI Chat Error:", error.message);
        next(new ApiError(500, 'AI Nutrition assistant is temporarily unavailable'));
    }
};
