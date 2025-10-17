import apiClient from './apiClient';

export const fetchConversations = (params) => apiClient.get('/messages/conversations', { params });
export const fetchMessages = (conversationId, params) =>
  apiClient.get(`/messages/${conversationId}`, { params });
export const sendMessage = (data) => apiClient.post('/messages/send', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const createDirectConversation = (participantId) =>
  apiClient.post('/messages/create-direct', { participantId });
export const createGroupConversation = (groupData) =>
  apiClient.post('/messages/create-group', groupData);
export const markAsRead = (conversationId) =>
  apiClient.patch(`/messages/${conversationId}/read`);
export const deleteConversation = (conversationId) =>
  apiClient.delete(`/messages/${conversationId}`);
export const fetchUnreadCount = () => apiClient.get('/messages/unread-count');
export const searchMessages = (params) => apiClient.get('/messages/search', { params });
