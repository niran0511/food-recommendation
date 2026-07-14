const axios = require('axios');
const MealPlan = require('../models/MealPlan');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.createOrUpdateMealPlan = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const doctorId = req.user.id;
        const { weekPlan, notes } = req.body;

        if (!userId) {
            throw new ApiError(400, "Patient ID is required");
        }

        // Save or update the meal plan
        const mealPlan = await MealPlan.findOneAndUpdate(
            { userId, doctorId },
            { weekPlan, notes },
            { upsert: true, new: true }
        );

        res.status(200).json(new ApiResponse(200, { mealPlan }, "Meal plan saved successfully"));
    } catch (error) {
        next(error);
    }
};

exports.getPatientMealPlan = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(400, "Patient ID is required");
        }

        const mealPlan = await MealPlan.findOne({ userId })
            .populate('weekPlan.Monday.breakfast weekPlan.Monday.lunch weekPlan.Monday.dinner weekPlan.Monday.snacks')
            .populate('weekPlan.Tuesday.breakfast weekPlan.Tuesday.lunch weekPlan.Tuesday.dinner weekPlan.Tuesday.snacks')
            .populate('weekPlan.Wednesday.breakfast weekPlan.Wednesday.lunch weekPlan.Wednesday.dinner weekPlan.Wednesday.snacks')
            .populate('weekPlan.Thursday.breakfast weekPlan.Thursday.lunch weekPlan.Thursday.dinner weekPlan.Thursday.snacks')
            .populate('weekPlan.Friday.breakfast weekPlan.Friday.lunch weekPlan.Friday.dinner weekPlan.Friday.snacks')
            .populate('weekPlan.Saturday.breakfast weekPlan.Saturday.lunch weekPlan.Saturday.dinner weekPlan.Saturday.snacks')
            .populate('weekPlan.Sunday.breakfast weekPlan.Sunday.lunch weekPlan.Sunday.dinner weekPlan.Sunday.snacks');

        res.status(200).json(new ApiResponse(200, { mealPlan }, "Meal plan retrieved successfully"));
    } catch (error) {
        next(error);
    }
};

exports.getMyMealPlan = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const mealPlan = await MealPlan.findOne({ userId })
            .populate('weekPlan.Monday.breakfast weekPlan.Monday.lunch weekPlan.Monday.dinner weekPlan.Monday.snacks')
            .populate('weekPlan.Tuesday.breakfast weekPlan.Tuesday.lunch weekPlan.Tuesday.dinner weekPlan.Tuesday.snacks')
            .populate('weekPlan.Wednesday.breakfast weekPlan.Wednesday.lunch weekPlan.Wednesday.dinner weekPlan.Wednesday.snacks')
            .populate('weekPlan.Thursday.breakfast weekPlan.Thursday.lunch weekPlan.Thursday.dinner weekPlan.Thursday.snacks')
            .populate('weekPlan.Friday.breakfast weekPlan.Friday.lunch weekPlan.Friday.dinner weekPlan.Friday.snacks')
            .populate('weekPlan.Saturday.breakfast weekPlan.Saturday.lunch weekPlan.Saturday.dinner weekPlan.Saturday.snacks')
            .populate('weekPlan.Sunday.breakfast weekPlan.Sunday.lunch weekPlan.Sunday.dinner weekPlan.Sunday.snacks');

        res.status(200).json(new ApiResponse(200, { mealPlan }, "User meal plan retrieved successfully"));
    } catch (error) {
        next(error);
    }
};

exports.getDailyMealPlan = async (req, res, next) => {
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
        
        let mealPlanData;
        try {
            const aiRes = await axios.post(`${aiUrl}/api/meal-plan`, payload);
            const data = aiRes.data;
            
            mealPlanData = {
                totalCalories: data.total_calories,
                totalProtein: data.total_protein,
                totalCarbs: data.total_carbs,
                totalFat: data.total_fat,
                breakfast: data.breakfast.map(f => ({ name: f.food, calories: f.calories, protein: f.protein, carbohydrates: f.carbohydrates, fat: f.fat })),
                lunch: data.lunch.map(f => ({ name: f.food, calories: f.calories, protein: f.protein, carbohydrates: f.carbohydrates, fat: f.fat })),
                dinner: data.dinner.map(f => ({ name: f.food, calories: f.calories, protein: f.protein, carbohydrates: f.carbohydrates, fat: f.fat })),
                snacks: data.snacks.map(f => ({ name: f.food, calories: f.calories, protein: f.protein, carbohydrates: f.carbohydrates, fat: f.fat }))
            };
        } catch (aiErr) {
            console.warn("⚠️ AI Service Error in getDailyMealPlan, using database fallback:", aiErr.message);
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
            
            const fallbackFoods = await Food.aggregate([
                { $match: matchQuery },
                { $sample: { size: 10 } }
            ]);
            
            const mapFood = (f) => ({
                name: f.name,
                calories: f.calories || 300,
                protein: f.protein || 15,
                carbohydrates: f.carbohydrates || 40,
                fat: f.fat || 10
            });
            
            mealPlanData = {
                totalCalories: 1800,
                totalProtein: 80,
                totalCarbs: 200,
                totalFat: 60,
                breakfast: fallbackFoods.slice(0, 2).map(mapFood),
                lunch: fallbackFoods.slice(2, 5).map(mapFood),
                dinner: fallbackFoods.slice(5, 8).map(mapFood),
                snacks: fallbackFoods.slice(8, 10).map(mapFood)
            };
        }
        
        res.status(200).json(new ApiResponse(200, { mealPlan: mealPlanData }, "Daily meal plan generated successfully"));
    } catch (error) {
        next(error);
    }
};

exports.getWeeklyMealPlan = async (req, res, next) => {
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
        
        let weeklyPlanArray = [];
        try {
            const aiRes = await axios.post(`${aiUrl}/api/weekly-plan`, payload);
            const data = aiRes.data;
            
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            for (const day of days) {
                const dayPlan = data[day];
                if (dayPlan) {
                    weeklyPlanArray.push({
                        day,
                        meals: {
                            breakfast: dayPlan.breakfast.map(f => ({ name: f.food, calories: f.calories, protein: f.protein, carbohydrates: f.carbohydrates, fat: f.fat })),
                            lunch: dayPlan.lunch.map(f => ({ name: f.food, calories: f.calories, protein: f.protein, carbohydrates: f.carbohydrates, fat: f.fat })),
                            dinner: dayPlan.dinner.map(f => ({ name: f.food, calories: f.calories, protein: f.protein, carbohydrates: f.carbohydrates, fat: f.fat })),
                            snacks: dayPlan.snacks.map(f => ({ name: f.food, calories: f.calories, protein: f.protein, carbohydrates: f.carbohydrates, fat: f.fat }))
                        }
                    });
                }
            }
        } catch (aiErr) {
            console.warn("⚠️ AI Service Error in getWeeklyMealPlan, using database fallback:", aiErr.message);
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
            
            const mapFood = (f) => ({
                name: f.name,
                calories: f.calories || 300,
                protein: f.protein || 15,
                carbohydrates: f.carbohydrates || 40,
                fat: f.fat || 10
            });
            
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            for (const day of days) {
                const fallbackFoods = await Food.aggregate([
                    { $match: matchQuery },
                    { $sample: { size: 10 } }
                ]);
                
                weeklyPlanArray.push({
                    day,
                    meals: {
                        breakfast: fallbackFoods.slice(0, 2).map(mapFood),
                        lunch: fallbackFoods.slice(2, 5).map(mapFood),
                        dinner: fallbackFoods.slice(5, 8).map(mapFood),
                        snacks: fallbackFoods.slice(8, 10).map(mapFood)
                    }
                });
            }
        }
        
        res.status(200).json(new ApiResponse(200, { mealPlan: { weeklyPlan: weeklyPlanArray } }, "Weekly meal plan generated successfully"));
    } catch (error) {
        next(error);
    }
};

