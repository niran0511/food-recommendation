const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    weight: Number,
    bmi: Number,
    caloriesConsumed: Number,
    caloriesTarget: Number,
    waterIntake: Number,
    healthScore: Number,
    notes: String,
    
    // Expanded clinical & lifestyle fields
    bloodPressureSystolic: Number,
    bloodPressureDiastolic: Number,
    bloodSugarLevel: Number,
    heartRate: Number,
    cholesterolLevel: Number,
    sleepHours: Number,
    exerciseMinutes: Number,
    mood: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    medications: String,
    dietaryCompliance: {
        type: String,
        enum: ['Excellent', 'Good', 'Needs Improvement', 'Poor']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
