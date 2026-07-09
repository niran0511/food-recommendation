const mongoose = require('mongoose');

const RecommendationLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    input: {
        type: Object
    },
    recommendations: [{
        food: String,
        score: Number,
        reasons: [String]
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('RecommendationLog', RecommendationLogSchema);
