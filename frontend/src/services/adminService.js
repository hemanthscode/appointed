import apiService from './apiService';

export const getUsers = (params) => apiService.request('/admin/users', { method: 'GET', params });
export const bulkUserOperation = (body) => apiService.request('/admin/users/bulk', { method: 'PATCH', body });

export const getApprovals = (params) => apiService.request('/admin/approvals', { method: 'GET', params });
export const approveUser = (id) => apiService.request(`/admin/approvals/${id}/approve`, { method: 'PATCH' });
export const rejectUser = (id) => apiService.request(`/admin/approvals/${id}/reject`, { method: 'PATCH' });

export const getSystemStats = () => apiService.request('/admin/stats', { method: 'GET' });
export const getSettings = () => apiService.request('/admin/settings', { method: 'GET' });
export const updateSettings = (body) => apiService.request('/admin/settings', { method: 'PUT', body });

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
