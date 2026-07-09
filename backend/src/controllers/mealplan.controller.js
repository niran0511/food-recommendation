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

    const user = req.user;
    const profile = user.profile;
    
    try {

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

        console.warn("⚠️ AI Service Error in createDailyMealPlan, falling back to database query:", error.message);
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
            
            const breakfastFoods = await Food.aggregate([
                { $match: { ...matchQuery, category: 'Breakfast' } },
                { $sample: { size: 1 } }
            ]);
            const lunchFoods = await Food.aggregate([
                { $match: { ...matchQuery, category: 'Lunch' } },
                { $sample: { size: 1 } }
            ]);
            const dinnerFoods = await Food.aggregate([
                { $match: { ...matchQuery, category: 'Dinner' } },
                { $sample: { size: 1 } }
            ]);
            const snackFoods = await Food.aggregate([
                { $match: { ...matchQuery, category: 'Snack' } },
                { $sample: { size: 1 } }
            ]);
            
            const mapFoodsLocal = (foods) => foods.map(f => ({
                name: f.name,
                calories: Math.round(f.calories || 300),
                protein: Number((f.protein || 15).toFixed(1)),
                carbs: Number((f.carbohydrates || 40).toFixed(1)),
                fat: Number((f.fat || 10).toFixed(1)),
                image: f.image || 'https://via.placeholder.com/300x200?text=Food'
            }));
            
            const breakfastMapped = mapFoodsLocal(breakfastFoods);
            const lunchMapped = mapFoodsLocal(lunchFoods);
            const dinnerMapped = mapFoodsLocal(dinnerFoods);
            const snackMapped = mapFoodsLocal(snackFoods);
            
            const totalCalories = Math.round(
                (breakfastMapped[0]?.calories || 300) + 
                (lunchMapped[0]?.calories || 400) + 
                (dinnerMapped[0]?.calories || 400) + 
                (snackMapped[0]?.calories || 150)
            );
            const totalProtein = Number((
                (breakfastMapped[0]?.protein || 15) + 
                (lunchMapped[0]?.protein || 20) + 
                (dinnerMapped[0]?.protein || 20) + 
                (snackMapped[0]?.protein || 5)
            ).toFixed(1));
            const totalCarbs = Number((
                (breakfastMapped[0]?.carbs || 30) + 
                (lunchMapped[0]?.carbs || 45) + 
                (dinnerMapped[0]?.carbs || 45) + 
                (snackMapped[0]?.carbs || 15)
            ).toFixed(1));
            const totalFat = Number((
                (breakfastMapped[0]?.fat || 10) + 
                (lunchMapped[0]?.fat || 15) + 
                (dinnerMapped[0]?.fat || 15) + 
                (snackMapped[0]?.fat || 5)
            ).toFixed(1));
            
            const mealPlan = await MealPlan.create({
                userId: user._id,
                type: 'daily',
                meals: {
                    breakfast: breakfastMapped,
                    lunch: lunchMapped,
                    dinner: dinnerMapped,
                    snacks: snackMapped
                },
                totalCalories,
                totalProtein,
                totalCarbs,
                totalFat
            });
            
            res.status(201).json(new ApiResponse(201, { mealPlan }, 'Fallback daily meal plan generated locally'));
        } catch (dbError) {
            console.error("Database fallback error in createDailyMealPlan:", dbError.message);
            next(new ApiError(500, 'Failed to fetch meal plan from AI service'));
        }

    }
};

exports.createWeeklyMealPlan = async (req, res, next) => {

    const user = req.user;
    const profile = user.profile;
    
    try {

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

        console.warn("⚠️ AI Service Error in createWeeklyMealPlan, falling back to database query:", error.message);
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
            
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const weeklyPlan = [];
            
            for (const day of days) {
                const breakfastFoods = await Food.aggregate([
                    { $match: { ...matchQuery, category: 'Breakfast' } },
                    { $sample: { size: 1 } }
                ]);
                const lunchFoods = await Food.aggregate([
                    { $match: { ...matchQuery, category: 'Lunch' } },
                    { $sample: { size: 1 } }
                ]);
                const dinnerFoods = await Food.aggregate([
                    { $match: { ...matchQuery, category: 'Dinner' } },
                    { $sample: { size: 1 } }
                ]);
                const snackFoods = await Food.aggregate([
                    { $match: { ...matchQuery, category: 'Snack' } },
                    { $sample: { size: 1 } }
                ]);
                
                const mapFoodsLocal = (foods) => foods.map(f => ({
                    name: f.name,
                    calories: Math.round(f.calories || 300),
                    protein: Number((f.protein || 15).toFixed(1)),
                    carbs: Number((f.carbohydrates || 40).toFixed(1)),
                    fat: Number((f.fat || 10).toFixed(1)),
                    image: f.image || 'https://via.placeholder.com/300x200?text=Food'
                }));
                
                weeklyPlan.push({
                    day,
                    meals: {
                        breakfast: mapFoodsLocal(breakfastFoods),
                        lunch: mapFoodsLocal(lunchFoods),
                        dinner: mapFoodsLocal(dinnerFoods),
                        snacks: mapFoodsLocal(snackFoods)
                    }
                });
            }
            
            const mealPlan = await MealPlan.create({
                userId: user._id,
                type: 'weekly',
                weeklyPlan
            });
            
            res.status(201).json(new ApiResponse(201, { mealPlan }, 'Fallback weekly meal plan generated locally'));
        } catch (dbError) {
            console.error("Database fallback error in createWeeklyMealPlan:", dbError.message);
            next(new ApiError(500, 'Failed to fetch weekly plan from AI service'));
        }

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
