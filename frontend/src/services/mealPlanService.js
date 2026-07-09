import api from './api';

export const mealPlanService = {
  getDailyPlan: async (date) => {
    const response = await api.get('/meal-plans/daily', { params: { date } });
    return response.data;
  },

  getWeeklyPlan: async (startDate) => {
    const response = await api.get('/meal-plans/weekly', { params: { start_date: startDate } });
    return response.data;
  },

  generateDailyPlan: async (preferences = {}) => {
    const response = await api.post('/meal-plans/generate/daily', preferences);
    return response.data;
  },

  generateWeeklyPlan: async (preferences = {}) => {
    const response = await api.post('/meal-plans/generate/weekly', preferences);
    return response.data;
  },

  saveMealPlan: async (planData) => {
    const response = await api.post('/meal-plans', planData);
    return response.data;
  },

  updateMealPlan: async (id, planData) => {
    const response = await api.put(`/meal-plans/${id}`, planData);
    return response.data;
  },

  deleteMealPlan: async (id) => {
    const response = await api.delete(`/meal-plans/${id}`);
    return response.data;
  },
};

export default mealPlanService;
