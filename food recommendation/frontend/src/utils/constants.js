// Application constants

export const APP_NAME = 'NutriAI';
export const APP_TAGLINE = 'Smart Food, Healthier You';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const BMI_CATEGORIES = [
  { label: 'Underweight', min: 0, max: 18.5, color: '#3b82f6' },
  { label: 'Normal', min: 18.5, max: 25, color: '#10b981' },
  { label: 'Overweight', min: 25, max: 30, color: '#f59e0b' },
  { label: 'Obese', min: 30, max: 100, color: '#ef4444' },
];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2 },
  { value: 'light', label: 'Lightly Active', description: 'Exercise 1-3 days/week', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately Active', description: 'Exercise 3-5 days/week', multiplier: 1.55 },
  { value: 'active', label: 'Very Active', description: 'Exercise 6-7 days/week', multiplier: 1.725 },
  { value: 'extreme', label: 'Extremely Active', description: 'Very hard exercise & physical job', multiplier: 1.9 },
];

export const HEALTH_GOALS = [
  { value: 'lose_weight', label: 'Lose Weight', icon: '⬇️' },
  { value: 'maintain', label: 'Maintain Weight', icon: '⚖️' },
  { value: 'gain_weight', label: 'Gain Weight', icon: '⬆️' },
  { value: 'build_muscle', label: 'Build Muscle', icon: '💪' },
  { value: 'improve_health', label: 'Improve Health', icon: '❤️' },
];

export const DIET_TYPES = [
  { value: 'any', label: 'No Restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'gluten_free', label: 'Gluten Free' },
];

export const CUISINE_TYPES = [
  'Indian', 'Chinese', 'Italian', 'Mexican', 'Japanese',
  'Thai', 'Mediterranean', 'American', 'Korean', 'Middle Eastern',
];

export const COMMON_ALLERGIES = [
  'Dairy', 'Eggs', 'Peanuts', 'Tree Nuts', 'Wheat',
  'Soy', 'Fish', 'Shellfish', 'Sesame', 'Gluten',
];

export const COMMON_DISEASES = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Obesity',
  'PCOS', 'Thyroid', 'Kidney Disease', 'Liver Disease',
  'Celiac Disease', 'IBS',
];

export const COMMON_DEFICIENCIES = [
  'Vitamin D', 'Vitamin B12', 'Iron', 'Calcium',
  'Vitamin C', 'Zinc', 'Magnesium', 'Omega-3',
  'Folate', 'Potassium',
];

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const FOOD_CATEGORIES = [
  'Fruits', 'Vegetables', 'Grains', 'Proteins', 'Dairy',
  'Nuts & Seeds', 'Legumes', 'Beverages', 'Snacks', 'Desserts',
];

export const BUDGET_OPTIONS = [
  { value: 'low', label: 'Budget Friendly', icon: '💰' },
  { value: 'medium', label: 'Moderate', icon: '💰💰' },
  { value: 'high', label: 'Premium', icon: '💰💰💰' },
];

export const RISK_LEVELS = {
  low: { label: 'Low', color: '#10b981', bg: '#d1fae5' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7' },
  high: { label: 'High', color: '#ef4444', bg: '#fef2f2' },
};

export const CHART_COLORS = {
  protein: '#10b981',
  carbs: '#6366f1',
  fat: '#f59e0b',
  fiber: '#8b5cf6',
  sugar: '#ef4444',
  sodium: '#f97316',
};
