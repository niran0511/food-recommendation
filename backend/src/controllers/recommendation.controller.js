const axios = require('axios');
const RecommendationLog = require('../models/RecommendationLog');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getRecommendations = async (req, res, next) => {
    try {
        const user = req.user;
        const profile = user.profile;
        
        if (!profile || !profile.age || !profile.height || !profile.weight) {
            return res.status(200).json(new ApiResponse(200, { recommendations: [] }, 'Profile incomplete'));
        }
        
        // Prepare payload for AI service
        const payload = {
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
        };

        const aiUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
        
        console.log("AI Recommendation Payload:", JSON.stringify(payload, null, 2));
        const response = await axios.post(`${aiUrl}/api/recommend`, payload);
        const recommendations = response.data;

        // Log the recommendation
        await RecommendationLog.create({
            userId: user._id,
            input: payload,
            recommendations: recommendations.map(r => ({
                food: r.food,
                score: r.score,
                reasons: r.reasons_for
            }))
        });

        res.status(200).json(new ApiResponse(200, { recommendations }));
    } catch (error) {
        console.error("AI Service Error:", error.message);
        next(new ApiError(500, 'Failed to fetch recommendations from AI service'));
    }
};

exports.getFoodsToAvoid = async (req, res, next) => {
    try {
        const user = req.user;
        const profile = user.profile;
        
        if (!profile || !profile.age || !profile.height || !profile.weight) {
            return res.status(200).json(new ApiResponse(200, { foodsToAvoid: [] }, 'Profile incomplete'));
        }
        
        const payload = {
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
        };

        const aiUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
        
        const response = await axios.post(`${aiUrl}/api/recommend/avoid`, payload);
        
        res.status(200).json(new ApiResponse(200, { foodsToAvoid: response.data }));
    } catch (error) {
        next(new ApiError(500, 'Failed to fetch foods to avoid from AI service'));
    }
};

exports.getRecommendationHistory = async (req, res, next) => {
    try {
        const logs = await RecommendationLog.find({ userId: req.user._id }).sort('-createdAt').limit(10);
        res.status(200).json(new ApiResponse(200, { logs }));
    } catch (error) {
        next(error);
    }
};
