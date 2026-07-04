const axios = require('axios');
const HealthRecord = require('../models/HealthRecord');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getHealthMetrics = async (req, res, next) => {
    const user = req.user;
    const profile = user.profile;
    
    try {
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
        console.warn("⚠️ AI Service Error in getHealthMetrics, calculating locally as fallback:", error.message);
        
        const weight = profile.weight || 70;
        const height = profile.height || 170;
        const age = profile.age || 30;
        const gender = profile.gender || 'Other';
        const goal = profile.goal || 'Healthy Eating';
        
        const height_m = height / 100;
        const bmi = Number((weight / (height_m * height_m)).toFixed(2));
        
        let bmi_category = "Normal";
        if (bmi < 18.5) bmi_category = "Underweight";
        else if (bmi < 25) bmi_category = "Normal";
        else if (bmi < 30) bmi_category = "Overweight";
        else bmi_category = "Obese";
        
        let bmr = 0;
        if (gender.toLowerCase() === "male") {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
        bmr = Number(bmr.toFixed(2));
        
        const multipliers = {
            "Sedentary": 1.2,
            "Lightly Active": 1.375,
            "Moderately Active": 1.55,
            "Very Active": 1.725,
            "Athlete": 1.9
        };
        const multiplier = multipliers[profile.activityLevel] || 1.2;
        const tdee = Number((bmr * multiplier).toFixed(2));
        
        let calories = tdee;
        let protein_ratio = 0.3;
        let carbs_ratio = 0.4;
        let fat_ratio = 0.3;
        
        if (goal === "Weight Loss" || goal === "Fat Loss") {
            calories = tdee - 500;
            protein_ratio = 0.4;
            carbs_ratio = 0.3;
            fat_ratio = 0.3;
        } else if (goal === "Weight Gain" || goal === "Muscle Gain") {
            calories = tdee + 500;
            protein_ratio = 0.3;
            carbs_ratio = 0.5;
            fat_ratio = 0.2;
        }
        
        const metrics = {
            bmi,
            bmi_category,
            bmr,
            tdee,
            daily_calories: Number(calories.toFixed(2)),
            daily_protein: Number(((calories * protein_ratio) / 4).toFixed(2)),
            daily_carbs: Number(((calories * carbs_ratio) / 4).toFixed(2)),
            daily_fat: Number(((calories * fat_ratio) / 9).toFixed(2)),
            daily_fiber: 30.0,
            water_intake: Number((weight * 0.035).toFixed(2))
        };
        
        res.status(200).json(new ApiResponse(200, { metrics }, 'Calculated locally as fallback'));
    }
};

exports.getRiskAssessment = async (req, res, next) => {
    const user = req.user;
    const profile = user.profile;
    
    try {
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
        console.warn("⚠️ AI Service Error in getRiskAssessment, calculating locally as fallback:", error.message);
        
        const weight = profile.weight || 70;
        const height = profile.height || 170;
        const age = profile.age || 30;
        const height_m = height / 100;
        const bmi = weight / (height_m * height_m);
        
        const obesity_risk = bmi > 30 ? 75.0 : (bmi > 25 ? 45.0 : 15.0);
        const diabetes_risk = bmi > 30 ? 65.0 : (bmi > 25 ? 35.0 : 10.0);
        const hypertension_risk = age > 50 ? 55.0 : (bmi > 25 ? 30.0 : 10.0);
        const heart_disease_risk = age > 50 ? 45.0 : (bmi > 30 ? 40.0 : 15.0);
        
        const overall_health_score = Number((100 - (obesity_risk + diabetes_risk + hypertension_risk + heart_disease_risk) / 4).toFixed(2));
        
        const riskAssessment = {
            obesity_risk,
            diabetes_risk,
            hypertension_risk,
            heart_disease_risk,
            overall_health_score,
            risk_factors: bmi > 25 ? ["Overweight BMI"] : ["None"],
            recommendations: ["Maintain a balanced whole-foods diet", "Stay active daily"]
        };
        
        res.status(200).json(new ApiResponse(200, { riskAssessment }, 'Calculated locally as fallback'));
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
