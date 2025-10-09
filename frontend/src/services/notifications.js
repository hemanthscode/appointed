import { apiClient } from './api';

export const notificationsService = {
  getAll: (params) => apiClient.get('/api/notifications', params),
  markAsRead: (notificationId) => apiClient.patch(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () => apiClient.patch('/api/notifications/read-all'),
  deleteNotification: (notificationId) => apiClient.delete(`/api/notifications/${notificationId}`),
  getUnreadCount: () => apiClient.get('/api/notifications/unread-count'),
};
