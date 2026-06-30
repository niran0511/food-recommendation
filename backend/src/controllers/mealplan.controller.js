const axios = require('axios');
const MealPlan = require('../models/MealPlan');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getMealPlans = async (req, res, next) => {
    try {
        const mealPlans = await MealPlan.find({ userId: req.user.id }).sort('-createdAt');
        res.status(200).json(new ApiResponse(200, { mealPlans }));
    } catch (error) {
        next(error);
    }
};

exports.getMealPlanById = async (req, res, next) => {
    try {
        const mealPlan = await MealPlan.findOne({ _id: req.params.id, userId: req.user.id });
        if (!mealPlan) {
            return next(new ApiError(404, 'Meal plan not found'));
        }
        res.status(200).json(new ApiResponse(200, { mealPlan }));
    } catch (error) {
        next(error);
    }
};

exports.createDailyMealPlan = async (req, res, next) => {
    try {
        const user = req.user;
        const profile = user.profile;
        
        if (!profile || !profile.age || !profile.height || !profile.weight) {
            return res.status(200).json(new ApiResponse(200, { mealPlan: null }, 'Profile incomplete'));
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
        
        console.log("AI Meal Plan Payload:", JSON.stringify(payload, null, 2));
        const response = await axios.post(`${aiUrl}/api/meal-plan`, payload);
        const planData = response.data;

        // Transform for DB
        const mapFoods = (foods) => foods.map(f => ({
            name: f.food,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbohydrates,
            fat: f.fat,
            image: f.image
        }));

        const mealPlan = await MealPlan.create({
            userId: user._id,
            type: 'daily',
            meals: {
                breakfast: mapFoods(planData.breakfast),
                lunch: mapFoods(planData.lunch),
                dinner: mapFoods(planData.dinner),
                snacks: mapFoods(planData.snacks)
            },
            totalCalories: planData.total_calories,
            totalProtein: planData.total_protein,
            totalCarbs: planData.total_carbs,
            totalFat: planData.total_fat
        });

        res.status(201).json(new ApiResponse(201, { mealPlan }));
    } catch (error) {
        console.error("AI Service Error:", error.message);
        next(new ApiError(500, 'Failed to fetch meal plan from AI service'));
    }
};

exports.createWeeklyMealPlan = async (req, res, next) => {
    try {
        const user = req.user;
        const profile = user.profile;
        
        if (!profile || !profile.age || !profile.height || !profile.weight) {
            return res.status(200).json(new ApiResponse(200, { mealPlan: null }, 'Profile incomplete'));
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
        
        const response = await axios.post(`${aiUrl}/api/weekly-plan`, payload);
        const planData = response.data;

        // Transform for DB
        const mapFoods = (foods) => foods.map(f => ({
            name: f.food,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbohydrates,
            fat: f.fat,
            image: f.image
        }));

        const weeklyPlan = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
            const dayData = planData[day];
            return {
                day,
                meals: {
                    breakfast: mapFoods(dayData.breakfast),
                    lunch: mapFoods(dayData.lunch),
                    dinner: mapFoods(dayData.dinner),
                    snacks: mapFoods(dayData.snacks)
                }
            };
        });

        const mealPlan = await MealPlan.create({
            userId: user._id,
            type: 'weekly',
            weeklyPlan
        });

        res.status(201).json(new ApiResponse(201, { mealPlan }));
    } catch (error) {
        next(new ApiError(500, 'Failed to fetch weekly plan from AI service'));
    }
};

exports.deleteMealPlan = async (req, res, next) => {
    try {
        const mealPlan = await MealPlan.findOne({ _id: req.params.id, userId: req.user.id });
        if (!mealPlan) {
            return next(new ApiError(404, 'Meal plan not found'));
        }
        await mealPlan.deleteOne();
        res.status(200).json(new ApiResponse(200, {}, 'Meal plan deleted'));
    } catch (error) {
        next(error);
    }
};
