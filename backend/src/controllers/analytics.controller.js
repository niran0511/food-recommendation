const HealthRecord = require('../models/HealthRecord');
const RecommendationLog = require('../models/RecommendationLog');
const { ApiResponse } = require('../utils/ApiResponse');

exports.getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        const healthRecords = await HealthRecord.find({ userId })
            .sort('-date')
            .limit(7)
            .lean();
            
        const recommendationCount = await RecommendationLog.countDocuments({ userId });
        
        res.status(200).json(new ApiResponse(200, {
            dashboard: {
                healthRecords,
                recommendationCount
            }
        }));
    } catch (error) {
        next(error);
    }
};

exports.getNutritionSummary = async (req, res, next) => {
    try {
        // Dummy summary data for now
        res.status(200).json(new ApiResponse(200, {
            summary: {
                averageCalories: 2000,
                averageProtein: 120,
                averageCarbs: 250,
                averageFat: 60
            }
        }));
    } catch (error) {
        next(error);
    }
};
