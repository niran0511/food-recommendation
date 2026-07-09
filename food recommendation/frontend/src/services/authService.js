import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password }, { withCredentials: true });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData, { withCredentials: true });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout', {}, { withCredentials: true });
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh', {}, { withCredentials: true });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

export default authService;
