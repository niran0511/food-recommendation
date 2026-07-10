const mongoose = require('mongoose');

const DiseaseRuleSchema = new mongoose.Schema({
    disease: {
        type: String,
        required: true,
        unique: true
    },
    avoidNutrients: [String],
    boostNutrients: [String],
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DiseaseRule', DiseaseRuleSchema);
