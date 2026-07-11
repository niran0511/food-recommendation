const mongoose = require('mongoose');

const IntakeQuestionnaireSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    dietaryPreferences: String,
    allergies: String,
    dailySchedule: String,
    budgetPreference: String,
    fitnessGoals: String,
    barriersToProgress: String,
    isSubmitted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IntakeQuestionnaire', IntakeQuestionnaireSchema);
