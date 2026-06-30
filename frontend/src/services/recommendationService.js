import api from './api';

export const recommendationService = {
  getRecommendations: async () => {
    const response = await api.get('/recommendations');
    return response.data;
  },

  generateRecommendations: async () => {
    const response = await api.post('/recommendations/generate');
    return response.data;
  },

  getAvoidFoods: async () => {
    const response = await api.get('/recommendations/avoid');
    return response.data;
  },

  rateRecommendation: async (id, rating) => {
    const response = await api.post(`/recommendations/${id}/rate`, { rating });
    return response.data;
  },

  getRecommendationHistory: async (params = {}) => {
    const response = await api.get('/recommendations/history', { params });
    return response.data;
  },
};

export default recommendationService;
