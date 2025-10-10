import apiService from './apiService';

export const getConversations = (params) => apiService.request('/messages/conversations', { method: 'GET', params });
export const getUnreadCount = () => apiService.request('/messages/unread-count', { method: 'GET' });
export const searchMessages = (params) => apiService.request('/messages/search', { method: 'GET', params });

export const getMessages = (conversationId, params) =>
  apiService.request(`/messages/${conversationId}`, { method: 'GET', params });
export const deleteConversation = (conversationId) => apiService.request(`/messages/${conversationId}`, { method: 'DELETE' });

export const markAsRead = (conversationId) => apiService.request(`/messages/${conversationId}/read`, { method: 'PATCH' });

// Send message supports file attachments, handled in apiService accordingly
export const sendMessage = (formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${apiService.appConfig.apiBaseUrl}/api/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: formData,
  }).then((res) => res.json());
};

export default {
  getConversations,
  getUnreadCount,
  searchMessages,
  getMessages,
  deleteConversation,
  markAsRead,
  sendMessage,
};
