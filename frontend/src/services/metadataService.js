import apiService from './apiService';

export const getDepartments = () => apiService.request('/metadata/departments', { method: 'GET' });
export const getSubjects = (department) =>
  apiService.request(`/metadata/subjects?department=${encodeURIComponent(department)}`, { method: 'GET' });
export const getTimeSlots = () => apiService.request('/metadata/time-slots', { method: 'GET' });
export const getAppointmentPurposes = () => apiService.request('/metadata/appointment-purposes', { method: 'GET' });
export const getUserYears = () => apiService.request('/metadata/user-years', { method: 'GET' });

export default {
  getDepartments,
  getSubjects,
  getTimeSlots,
  getAppointmentPurposes,
  getUserYears,
};
