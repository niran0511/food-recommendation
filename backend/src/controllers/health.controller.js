const axios = require('axios');
const HealthRecord = require('../models/HealthRecord');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getHealthMetrics = async (req, res, next) => {
    try {
        const user = req.user;
        const profile = user.profile;
        
        if (!profile || !profile.age || !profile.height || !profile.weight) {
            return res.status(200).json(new ApiResponse(200, { metrics: null }, 'Profile incomplete'));
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
        
        const response = await axios.post(`${aiUrl}/api/health-metrics`, payload);
        
        res.status(200).json(new ApiResponse(200, { metrics: response.data }));
    } catch (error) {
        console.error("AI Service Error in getHealthMetrics:", error.message, error.response?.data);
        next(new ApiError(500, 'Failed to fetch health metrics from AI service'));
    }
};

exports.getRiskAssessment = async (req, res, next) => {
    try {
        const user = req.user;
        const profile = user.profile;
        
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
        
        const response = await axios.post(`${aiUrl}/api/health-risk`, payload);
        
        res.status(200).json(new ApiResponse(200, { riskAssessment: response.data }));
    } catch (error) {
        next(new ApiError(500, 'Failed to fetch risk assessment from AI service'));
    }
};

exports.saveHealthRecord = async (req, res, next) => {
    try {
        req.body.userId = req.user.id;
        const record = await HealthRecord.create(req.body);
        res.status(201).json(new ApiResponse(201, { record }));
    } catch (error) {
        next(error);
    }
};

exports.getHealthRecords = async (req, res, next) => {
    try {
        const records = await HealthRecord.find({ userId: req.user.id }).sort('-date');
        res.status(200).json(new ApiResponse(200, { records }));
    } catch (error) {
        next(error);
    }
};
