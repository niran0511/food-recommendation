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
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
