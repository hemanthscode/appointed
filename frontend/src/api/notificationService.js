import apiClient from './apiClient';

export const fetchNotifications = (params) => apiClient.get('/notifications', { params });
export const markNotificationAsRead = (id) => apiClient.patch(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => apiClient.patch('/notifications/read-all');
export const deleteNotification = (id) => apiClient.delete(`/notifications/${id}`);
