const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: String,
    category: String,
    cuisine: String,
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
    potassium: Number,
    calcium: Number,
    iron: Number,
    vitamin_a: Number,
    vitamin_b: Number,
    vitamin_c: Number,
    vitamin_d: Number,
    vitamin_e: Number,
    cholesterol: Number,
    omega_3: Number,
    ingredients: [String],
    allergens: [String],
    cooking_time: Number,
    difficulty: String,
    price: String,
    rating: Number,
    meal_type: [String],
    suitable_for: [String],
    avoid_for: [String],
    diet_type: [String]
}, {
    timestamps: true
});

// Text index for search
FoodSchema.index({ name: 'text', category: 'text', cuisine: 'text' });

module.exports = mongoose.model('Food', FoodSchema);
