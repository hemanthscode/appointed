import apiService from './apiService';

const getProfile = () => apiService.request('/users/profile', { method: 'GET' });

const updateProfile = (profileData) =>
  apiService.request('/users/profile', { method: 'PUT', body: profileData });

const uploadAvatar = (formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${apiService.appConfig.apiBaseUrl}/api/users/avatar`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  }).then((res) => res.json());
};

const getTeachers = (params) => {
  const query = new URLSearchParams(params).toString();
  return apiService.request(`/users/teachers?${query}`, { method: 'GET' });
};

const getStudents = (params) => {
  const query = new URLSearchParams(params).toString();
  return apiService.request(`/users/students?${query}`, { method: 'GET' });
};

const changePassword = (passwordData) =>
  apiService.request('/users/change-password', { method: 'PUT', body: passwordData });

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  getTeachers,
  getStudents,
  changePassword,
};
