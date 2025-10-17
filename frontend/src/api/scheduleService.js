import apiClient from './apiClient';

export const getTeacherSchedule = (params) => apiClient.get('/schedule', { params });
export const updateScheduleSlots = (slots) => apiClient.put('/schedule', { scheduleSlots: slots });
export const getScheduleStats = (params) => apiClient.get('/schedule/stats', { params });
export const getAvailableSlots = (teacherId, params) =>
  apiClient.get(`/schedule/available/${teacherId}`, { params });
export const blockSlot = (data) => apiClient.post('/schedule/block', data);
export const unblockSlot = (slotId) => apiClient.delete(`/schedule/block/${slotId}`);
export const deleteSlot = (slotId) => apiClient.delete(`/schedule/${slotId}`);
