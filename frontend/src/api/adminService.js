import apiClient from './apiClient';

export const getUsers = (params) => apiClient.get('/admin/users', { params });
export const bulkUserOperation = (operationData) =>
  apiClient.patch('/admin/users/bulk', operationData);
export const getApprovals = (params) => apiClient.get('/admin/approvals', { params });
export const approveUser = (id) => apiClient.patch(`/admin/approvals/${id}/approve`);
export const rejectUser = (id) => apiClient.patch(`/admin/approvals/${id}/reject`);
export const getSystemStats = (params) => apiClient.get('/admin/stats', { params });
export const getSettings = () => apiClient.get('/admin/settings');
export const updateSettings = (data) => apiClient.put('/admin/settings', data);
