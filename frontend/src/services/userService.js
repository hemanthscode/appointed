import apiService from './apiService';

// Profiles are returned as user object directly (unwrapped)
const getProfile = () => apiService.request('/users/profile');

const updateProfile = (profileData) =>
  apiService.request('/users/profile', { method: 'PUT', body: profileData });

const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiService.request('/users/avatar', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': undefined },
  });
};

const changePassword = (passwords) =>
  apiService.request('/users/change-password', { method: 'PUT', body: passwords });

const getTeachers = (params = {}) =>
  apiService.request(`/users/teachers${params ? `?${new URLSearchParams(params).toString()}` : ''}`);

const getStudents = (params = {}) =>
  apiService.request(`/users/students${params ? `?${new URLSearchParams(params).toString()}` : ''}`);

const getUserById = (id) => apiService.request(`/users/${id}`);

const updateUserStatus = (id, status) =>
  apiService.request(`/users/${id}/status`, { method: 'PATCH', body: { status } });

const deleteUser = (id) => apiService.request(`/users/${id}`, { method: 'DELETE' });

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getTeachers,
  getStudents,
  getUserById,
  updateUserStatus,
  deleteUser,
};
