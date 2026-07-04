const axios = require('axios');
const RecommendationLog = require('../models/RecommendationLog');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getRecommendations = async (req, res, next) => {
    const user = req.user;
    const profile = user.profile;
    
    try {
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
        console.warn("⚠️ AI Service Error in getRecommendations, falling back to database query:", error.message);
        try {
            const Food = require('../models/Food');
            const matchQuery = {};
            
            if (profile.dietType === 'Vegan') {
                matchQuery.diet_type = 'Vegan';
            } else if (profile.dietType === 'Vegetarian') {
                matchQuery.diet_type = { $in: ['Vegetarian', 'Vegan'] };
            }
            
            if (profile.diseases && profile.diseases.length > 0) {
                matchQuery.avoid_for = { $nin: profile.diseases };
            }
            
            if (profile.allergies && profile.allergies.length > 0) {
                const allergyRegexes = profile.allergies
                    .filter(a => a && a.toLowerCase() !== 'none')
                    .map(a => new RegExp(a.trim(), 'i'));
                
                if (allergyRegexes.length > 0) {
                    matchQuery.name = { $nin: allergyRegexes };
                    matchQuery.ingredients = { $nin: allergyRegexes };
                }
            }
            
            const fallbackFoods = await Food.aggregate([
                { $match: matchQuery },
                { $sample: { size: 10 } }
            ]);
            
            const recommendations = fallbackFoods.map(f => ({
                food: f.name,
                image: f.image || 'https://via.placeholder.com/300x200?text=Food',
                category: f.category || 'Lunch',
                cuisine: f.cuisine || 'American',
                score: 50.0,
                calories: f.calories || 300,
                protein: f.protein || 10,
                carbohydrates: f.carbohydrates || 40,
                fat: f.fat || 10,
                fiber: f.fiber || 3,
                reasons_for: ["Fallback recommendations from database"],
                reasons_against: [],
                meal_type: f.meal_type || ['Lunch']
            }));
            
            res.status(200).json(new ApiResponse(200, { recommendations }));
        } catch (dbError) {
            console.error("Database fallback error in getRecommendations:", dbError.message);
            next(new ApiError(500, 'Failed to fetch recommendations from AI service'));
        }
    }
};

exports.getFoodsToAvoid = async (req, res, next) => {
    const user = req.user;
    const profile = user.profile;
    
    try {
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
        console.warn("⚠️ AI Service Error in getFoodsToAvoid, falling back to database query:", error.message);
        try {
            const Food = require('../models/Food');
            const conditions = [];
            
            if (profile.diseases && profile.diseases.length > 0) {
                conditions.push({ avoid_for: { $in: profile.diseases } });
            }
            
            if (profile.allergies && profile.allergies.length > 0) {
                const allergyRegexes = profile.allergies
                    .filter(a => a && a.toLowerCase() !== 'none')
                    .map(a => new RegExp(a.trim(), 'i'));
                
                if (allergyRegexes.length > 0) {
                    conditions.push({ name: { $in: allergyRegexes } });
                    conditions.push({ ingredients: { $in: allergyRegexes } });
                }
            }
            
            const matchQuery = conditions.length > 0 ? { $or: conditions } : { _id: null };
            
            const fallbackAvoidFoods = await Food.find(matchQuery).limit(5);
            
            const foodsToAvoid = fallbackAvoidFoods.map(f => ({
                food: f.name,
                image: f.image || 'https://via.placeholder.com/300x200?text=Food',
                category: f.category || 'Lunch',
                cuisine: f.cuisine || 'American',
                score: 30.0,
                calories: f.calories || 300,
                protein: f.protein || 10,
                carbohydrates: f.carbohydrates || 40,
                fat: f.fat || 10,
                fiber: f.fiber || 3,
                reasons_for: [],
                reasons_against: ["Contains ingredients to avoid for your profile conditions"],
                meal_type: f.meal_type || ['Lunch']
            }));
            
            res.status(200).json(new ApiResponse(200, { foodsToAvoid }));
        } catch (dbError) {
            console.error("Database fallback error in getFoodsToAvoid:", dbError.message);
            next(new ApiError(500, 'Failed to fetch foods to avoid from AI service'));
        }
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
