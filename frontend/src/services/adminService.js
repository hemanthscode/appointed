import apiService from './apiService';

const getUsers = (params = {}) =>
  apiService.request(`/admin/users${params ? `?${new URLSearchParams(params).toString()}` : ''}`);

const bulkUserOperation = (data) =>
  apiService.request('/admin/users/bulk', { method: 'PATCH', body: data });

const getApprovals = (params = {}) =>
  apiService.request(`/admin/approvals${params ? `?${new URLSearchParams(params).toString()}` : ''}`);

const approveUser = (id) => apiService.request(`/admin/approvals/${id}/approve`, { method: 'PATCH' });

const rejectUser = (id) => apiService.request(`/admin/approvals/${id}/reject`, { method: 'PATCH' });

const getSystemStats = () => apiService.request('/admin/stats');

const getSettings = () => apiService.request('/admin/settings');

const updateSettings = (data) =>
  apiService.request('/admin/settings', { method: 'PUT', body: data });

export default {
  getUsers,
  bulkUserOperation,
  getApprovals,
  approveUser,
  rejectUser,
  getSystemStats,
  getSettings,
  updateSettings,
};
