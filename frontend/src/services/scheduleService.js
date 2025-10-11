import apiService from './apiService';

const getSchedule = (params) =>
  apiService.request(`/schedule?${new URLSearchParams(params).toString()}`);

const updateSchedule = (scheduleData) =>
  apiService.request('/schedule', { method: 'PUT', body: scheduleData });

const getScheduleStats = () => apiService.request('/schedule/stats');

const getAvailableSlots = (teacherId) =>
  apiService.request(`/schedule/available/${teacherId}`);

const blockSlot = (slotData) =>
  apiService.request('/schedule/block', { method: 'POST', body: slotData });

const unblockSlot = (slotId) =>
  apiService.request(`/schedule/block/${slotId}`, { method: 'DELETE' });

const deleteSlot = (slotId) =>
  apiService.request(`/schedule/${slotId}`, { method: 'DELETE' });

export default {
  getSchedule,
  updateSchedule,
  getScheduleStats,
  getAvailableSlots,
  blockSlot,
  unblockSlot,
  deleteSlot,
};
