const IntakeQuestionnaire = require('../models/IntakeQuestionnaire');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

exports.submitIntake = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { dietaryPreferences, allergies, dailySchedule, budgetPreference, fitnessGoals, barriersToProgress } = req.body;

        const questionnaire = await IntakeQuestionnaire.findOneAndUpdate(
            { userId },
            {
                dietaryPreferences,
                allergies,
                dailySchedule,
                budgetPreference,
                fitnessGoals,
                barriersToProgress,
                isSubmitted: true
            },
            { upsert: true, new: true }
        );

        res.status(200).json(new ApiResponse(200, { questionnaire }, "Intake questionnaire submitted successfully"));
    } catch (error) {
        next(error);
    }
};

exports.getIntake = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const questionnaire = await IntakeQuestionnaire.findOne({ userId });

        res.status(200).json(new ApiResponse(200, { questionnaire }, "Intake questionnaire retrieved successfully"));
    } catch (error) {
        next(error);
    }
};

exports.getPatientIntake = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(400, "Patient ID is required");
        }

        const questionnaire = await IntakeQuestionnaire.findOne({ userId });

        res.status(200).json(new ApiResponse(200, { questionnaire }, "Patient intake questionnaire retrieved successfully"));
    } catch (error) {
        next(error);
    }
};
