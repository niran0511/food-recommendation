const mongoose = require('mongoose');

const MealDaySchema = new mongoose.Schema({
    breakfast: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }],
    lunch: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }],
    dinner: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }],
    snacks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }]
}, { _id: false });

const MealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weekPlan: {
        Monday: { type: MealDaySchema, default: () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] }) },
        Tuesday: { type: MealDaySchema, default: () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] }) },
        Wednesday: { type: MealDaySchema, default: () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] }) },
        Thursday: { type: MealDaySchema, default: () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] }) },
        Friday: { type: MealDaySchema, default: () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] }) },
        Saturday: { type: MealDaySchema, default: () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] }) },
        Sunday: { type: MealDaySchema, default: () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] }) }
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
