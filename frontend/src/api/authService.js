import apiClient from './apiClient';

export const register = (userData) => apiClient.post('/auth/register', userData);
export const login = (credentials) => apiClient.post('/auth/login', credentials);
export const logout = () => apiClient.post('/auth/logout');
export const refreshToken = (refreshToken) => apiClient.post('/auth/refresh', { refreshToken });
export const forgotPassword = (email) => apiClient.post('/auth/forgot-password', { email });
export const resetPassword = (data) => apiClient.post('/auth/reset-password', data);
export const getMe = () => apiClient.get('/auth/me');
