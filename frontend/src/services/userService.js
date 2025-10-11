import apiService from './apiService';

const getProfile = async () => {
  const data = await apiService.request('/users/profile');
  return data;
};

const updateProfile = async (profileData) => {
  const data = await apiService.request('/users/profile', {
    method: 'PUT',
    body: profileData,
  });
  return data;
};

const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const data = await apiService.request('/users/avatar', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': undefined }, // browser sets this with FormData automatically
  });

  return data;
};

const changePassword = async (passwords) => {
  const data = await apiService.request('/users/change-password', {
    method: 'PUT',
    body: passwords,
  });
  return data;
};

const getTeachers = async (params) => {
  const query = new URLSearchParams(params).toString();
  const data = await apiService.request(`/users/teachers?${query}`);
  return data;
};

const getStudents = async (params) => {
  const query = new URLSearchParams(params).toString();
  const data = await apiService.request(`/users/students?${query}`);
  return data;
};

const getUserById = async (id) => {
  const data = await apiService.request(`/users/${id}`);
  return data;
};

const updateUserStatus = async (id, status) => {
  const data = await apiService.request(`/users/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return data;
};

const deleteUser = async (id) => {
  const data = await apiService.request(`/users/${id}`, { method: 'DELETE' });
  return data;
};

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
