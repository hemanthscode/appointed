import apiService from './apiService';

const getConversations = (params) => apiService.request(`/messages/conversations?${new URLSearchParams(params).toString()}`);

const getUnreadCount = () => apiService.request('/messages/unread-count');

const searchMessages = (params) => apiService.request(`/messages/search?${new URLSearchParams(params).toString()}`);

const getMessages = (conversationId, params) =>
  apiService.request(`/messages/${conversationId}?${new URLSearchParams(params).toString()}`);

const sendMessage = (data) => {
  const formData = new FormData();
  if (data.content) formData.append('content', data.content);
  if (data.receiver) formData.append('receiver', data.receiver);
  if (data.files) {
    data.files.forEach((file) => formData.append('files', file));
  }
  return apiService.request('/messages/send', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': undefined }, // browser sets automatically for FormData
  });
};

const markAsRead = (conversationId) =>
  apiService.request(`/messages/${conversationId}/read`, { method: 'PATCH' });

const deleteConversation = (conversationId) =>
  apiService.request(`/messages/${conversationId}`, { method: 'DELETE' });

export default {
  getConversations,
  getUnreadCount,
  searchMessages,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
};
