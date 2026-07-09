import api from './api';

export const healthService = {
  getHealthSummary: async () => {
    const response = await api.get('/health/summary');
    return response.data;
  },

  getRiskAssessment: async () => {
    const response = await api.get('/health/risk-assessment');
    return response.data;
  },

  getNutritionAnalysis: async () => {
    const response = await api.get('/health/nutrition-analysis');
    return response.data;
  },

  getDeficiencies: async () => {
    const response = await api.get('/health/deficiencies');
    return response.data;
  },

  getWeeklyProgress: async () => {
    const response = await api.get('/health/weekly-progress');
    return response.data;
  },

  logWaterIntake: async (glasses) => {
    const response = await api.post('/health/water-intake', { glasses });
    return response.data;
  },

  getDailyIntake: async (date) => {
    const response = await api.get('/health/daily-intake', { params: { date } });
    return response.data;
  },
};

export default healthService;
