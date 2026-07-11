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
        
        const latestRecord = await HealthRecord.findOne({ userId: req.user.id }).sort('-date');
        const currentWeight = (latestRecord && latestRecord.weight) ? latestRecord.weight : (profile.weight || 70);
        
        const payload = {
            age: profile.age || 30,
            gender: profile.gender || 'Other',
            height: profile.height || 170,
            weight: currentWeight,
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
        
        let responseData;
        try {
            const response = await axios.post(`${aiUrl}/api/health-metrics`, payload);
            responseData = response.data;
        } catch (error) {
            console.warn("⚠️ AI Service Error in getHealthMetrics, calculating locally as fallback:", error.message);
            
            const weight = currentWeight;
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
            
            responseData = {
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
        }

        if (latestRecord) {
            if (latestRecord.caloriesTarget) {
                responseData.daily_calories = latestRecord.caloriesTarget;
                const goal = profile.goal || 'Healthy Eating';
                let protein_ratio = 0.3, carbs_ratio = 0.4, fat_ratio = 0.3;
                if (goal === "Weight Loss" || goal === "Fat Loss") {
                    protein_ratio = 0.4; carbs_ratio = 0.3; fat_ratio = 0.3;
                } else if (goal === "Weight Gain" || goal === "Muscle Gain") {
                    protein_ratio = 0.3; carbs_ratio = 0.5; fat_ratio = 0.2;
                }
                responseData.daily_protein = Number(((latestRecord.caloriesTarget * protein_ratio) / 4).toFixed(2));
                responseData.daily_carbs = Number(((latestRecord.caloriesTarget * carbs_ratio) / 4).toFixed(2));
                responseData.daily_fat = Number(((latestRecord.caloriesTarget * fat_ratio) / 9).toFixed(2));
            }
            if (latestRecord.waterIntake) {
                responseData.water_intake = latestRecord.waterIntake;
            }
        }

        res.status(200).json(new ApiResponse(200, { metrics: responseData }));
    } catch (error) {
        next(error);
    }
};

exports.getRiskAssessment = async (req, res, next) => {

    const user = req.user;
    const profile = user.profile;
    
    try {
        const latestRecord = await HealthRecord.findOne({ userId: req.user.id }).sort('-date');
        const currentWeight = (latestRecord && latestRecord.weight) ? latestRecord.weight : (profile.weight || 70);

        const payload = {
            age: profile.age || 30,
            gender: profile.gender || 'Other',
            height: profile.height || 170,
            weight: currentWeight,
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
        let riskAssessment;
        
        try {
            const response = await axios.post(`${aiUrl}/api/health-risk`, payload);
            riskAssessment = response.data;
        } catch (aiErr) {
            console.warn("⚠️ AI Service Error in getRiskAssessment, calculating locally as fallback:", aiErr.message);
            const height = profile.height || 170;
            const age = profile.age || 30;
            const height_m = height / 100;
            const bmi = currentWeight / (height_m * height_m);
            
            let obesity_risk = bmi > 30 ? 0.75 : (bmi > 25 ? 0.45 : 0.15);
            let diabetes_risk = bmi > 30 ? 0.65 : (bmi > 25 ? 0.35 : 0.10);
            let hypertension_risk = age > 50 ? 0.55 : (bmi > 25 ? 0.30 : 0.10);
            let heart_disease_risk = age > 50 ? 0.45 : (bmi > 30 ? 0.40 : 0.15);
            
            const diseases = (profile.diseases || []).map(d => d.toLowerCase());
            if (diseases.includes('diabetes')) {
                diabetes_risk = 1.0;
            }
            if (diseases.includes('hypertension')) {
                hypertension_risk = 1.0;
                heart_disease_risk = Math.max(heart_disease_risk, 0.6);
            }
            if (diseases.includes('heart disease')) {
                heart_disease_risk = 1.0;
            }
            
            const overall_health_score = Number((100 - (obesity_risk + diabetes_risk + hypertension_risk + heart_disease_risk) / 4 * 100).toFixed(2));
            
            riskAssessment = {
                obesity_risk,
                diabetes_risk,
                hypertension_risk,
                heart_disease_risk,
                overall_health_score,
                risk_factors: bmi > 25 ? ["Overweight BMI"] : ["None"],
                recommendations: ["Maintain a balanced whole-foods diet", "Stay active daily"]
            };
        }

        // Apply Nutritionist Health Record overrides and calculations
        if (latestRecord) {
            if (latestRecord.healthScore) {
                riskAssessment.overall_health_score = latestRecord.healthScore;
            }
            
            // Adjust diabetes risk based on blood sugar level
            if (latestRecord.bloodSugarLevel) {
                const sugar = latestRecord.bloodSugarLevel;
                if (sugar >= 126) {
                    riskAssessment.diabetes_risk = 1.0;
                    if (!riskAssessment.risk_factors.includes("Diabetic Blood Sugar")) {
                        riskAssessment.risk_factors.push(`Diabetic Blood Sugar (${sugar} mg/dL)`);
                    }
                } else if (sugar >= 100) {
                    riskAssessment.diabetes_risk = Math.max(riskAssessment.diabetes_risk || 0, 0.70);
                    if (!riskAssessment.risk_factors.includes("Pre-diabetic Blood Sugar")) {
                        riskAssessment.risk_factors.push(`Pre-diabetic Blood Sugar (${sugar} mg/dL)`);
                    }
                } else {
                    riskAssessment.diabetes_risk = Math.min(riskAssessment.diabetes_risk || 1, 0.25);
                }
            }

            // Adjust hypertension risk based on blood pressure
            if (latestRecord.bloodPressureSystolic || latestRecord.bloodPressureDiastolic) {
                const sys = latestRecord.bloodPressureSystolic || 120;
                const dia = latestRecord.bloodPressureDiastolic || 80;
                if (sys >= 140 || dia >= 90) {
                    riskAssessment.hypertension_risk = 1.0;
                    if (!riskAssessment.risk_factors.includes("Hypertensive Blood Pressure")) {
                        riskAssessment.risk_factors.push(`Hypertensive Blood Pressure (${sys}/${dia} mmHg)`);
                    }
                } else if (sys >= 120 || dia >= 80) {
                    riskAssessment.hypertension_risk = Math.max(riskAssessment.hypertension_risk || 0, 0.60);
                    if (!riskAssessment.risk_factors.includes("Elevated Blood Pressure")) {
                        riskAssessment.risk_factors.push(`Elevated Blood Pressure (${sys}/${dia} mmHg)`);
                    }
                } else {
                    riskAssessment.hypertension_risk = Math.min(riskAssessment.hypertension_risk || 1, 0.25);
                }
            }

            // Adjust heart disease risk based on cholesterol
            if (latestRecord.cholesterolLevel) {
                const chol = latestRecord.cholesterolLevel;
                if (chol >= 240) {
                    riskAssessment.heart_disease_risk = Math.max(riskAssessment.heart_disease_risk || 0, 0.85);
                    if (!riskAssessment.risk_factors.includes("High Cholesterol")) {
                        riskAssessment.risk_factors.push(`High Cholesterol (${chol} mg/dL)`);
                    }
                } else if (chol >= 200) {
                    riskAssessment.heart_disease_risk = Math.max(riskAssessment.heart_disease_risk || 0, 0.55);
                    if (!riskAssessment.risk_factors.includes("Borderline Cholesterol")) {
                        riskAssessment.risk_factors.push(`Borderline Cholesterol (${chol} mg/dL)`);
                    }
                } else {
                    riskAssessment.heart_disease_risk = Math.min(riskAssessment.heart_disease_risk || 1, 0.25);
                }
            }
        }
        
        res.status(200).json(new ApiResponse(200, { riskAssessment, latestRecord }));
    } catch (error) {
        next(error);
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

exports.getLatestHealthRecord = async (req, res, next) => {
    try {
        const record = await HealthRecord.findOne({ userId: req.user.id }).sort('-date');
        res.status(200).json(new ApiResponse(200, { record }));
    } catch (error) {
        next(error);
    }
};
