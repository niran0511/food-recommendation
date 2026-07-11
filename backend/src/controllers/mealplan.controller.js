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
