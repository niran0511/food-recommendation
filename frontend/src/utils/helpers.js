// Utility helper functions

/**
 * Calculate BMI from weight (kg) and height (cm)
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
};

/**
 * Get BMI category label and color
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6', textColor: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', color: '#10b981', textColor: 'text-emerald-500' };
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b', textColor: 'text-amber-500' };
  return { label: 'Obese', color: '#ef4444', textColor: 'text-red-500' };
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age) return 0;
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
};

/**
 * Calculate TDEE
 */
export const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Format date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get color for AI score
 */
export const getScoreColor = (score) => {
  if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50' };
  if (score >= 60) return { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50' };
  return { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-50' };
};

/**
 * Get color for health risk level
 */
export const getRiskColor = (level) => {
  const colors = {
    low: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
    medium: { bg: '#fef9c3', text: '#ca8a04', border: '#fef08a' },
    high: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
  };
  return colors[level] || colors.low;
};

/**
 * Delay helper for async operations
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Clamp number between min and max
 */
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * Generate random ID
 */
export const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Calculate percentage
 */
export const percentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get greeting based on time
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};
