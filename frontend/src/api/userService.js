import apiClient from './apiClient';

export const getProfile = () => apiClient.get('/users/profile');
export const updateProfile = (data) => apiClient.put('/users/profile', data);
export const uploadAvatar = (formData) =>
  apiClient.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const changePassword = (data) => apiClient.put('/users/change-password', data);
export const getTeachers = (params) => apiClient.get('/users/teachers', { params });
export const getStudents = (params) => apiClient.get('/users/students', { params });
export const getUserById = (id) => apiClient.get(`/users/${id}`);
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);
export const updateUserStatus = (id, status) => apiClient.patch(`/users/${id}/status`, { status });
