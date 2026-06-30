import api from './api';

export const adminService = {
  // User management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Food management
  getAdminFoods: async (params = {}) => {
    const response = await api.get('/admin/foods', { params });
    return response.data;
  },

  createFood: async (foodData) => {
    const response = await api.post('/admin/foods', foodData);
    return response.data;
  },

  updateFood: async (id, foodData) => {
    const response = await api.put(`/admin/foods/${id}`, foodData);
    return response.data;
  },

  deleteFood: async (id) => {
    const response = await api.delete(`/admin/foods/${id}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Recommendation logs
  getRecommendationLogs: async (params = {}) => {
    const response = await api.get('/admin/recommendations/logs', { params });
    return response.data;
  },
};

export default adminService;
