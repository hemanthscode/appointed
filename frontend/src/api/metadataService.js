import apiClient from './apiClient';

export const getDepartments = () => apiClient.get('/metadata/departments');
export const getSubjects = (params) => apiClient.get('/metadata/subjects', { params });
export const getTimeSlots = () => apiClient.get('/metadata/time-slots');
export const getAppointmentPurposes = () => apiClient.get('/metadata/appointment-purposes');
export const getUserYears = () => apiClient.get('/metadata/user-years');
