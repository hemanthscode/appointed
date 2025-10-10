import apiService from './apiService';

export const getSchedule = (params) => apiService.request('/schedule', { method: 'GET', params });
export const updateSchedule = (body) => apiService.request('/schedule', { method: 'PUT', body });
export const getScheduleStats = () => apiService.request('/schedule/stats', { method: 'GET' });
export const getAvailableSlots = (teacherId) => apiService.request(`/schedule/available/${teacherId}`, { method: 'GET' });

export const blockSlot = (body) => apiService.request('/schedule/block', { method: 'POST', body });
export const unblockSlot = (slotId) => apiService.request(`/schedule/block/${slotId}`, { method: 'DELETE' });
export const deleteSlot = (slotId) => apiService.request(`/schedule/${slotId}`, { method: 'DELETE' });

export default {
  getSchedule,
  updateSchedule,
  getScheduleStats,
  getAvailableSlots,
  blockSlot,
  unblockSlot,
  deleteSlot,
};
