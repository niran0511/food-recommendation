const mongoose = require('mongoose');

const MealItemSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    },
    name: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    image: String
}, { _id: false });

const MealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['daily', 'weekly'],
        required: true
    },
    meals: {
        breakfast: [MealItemSchema],
        lunch: [MealItemSchema],
        dinner: [MealItemSchema],
        snacks: [MealItemSchema]
    },
    totalCalories: Number,
    totalProtein: Number,
    totalCarbs: Number,
    totalFat: Number,
    weeklyPlan: [{
        day: String,
        meals: {
            breakfast: [MealItemSchema],
            lunch: [MealItemSchema],
            dinner: [MealItemSchema],
            snacks: [MealItemSchema]
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
