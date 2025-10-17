import apiClient from './apiClient';

export const fetchAppointments = (params) => apiClient.get('/appointments', { params });
export const fetchAppointmentById = (id) => apiClient.get(`/appointments/${id}`);
export const createAppointment = (data) => apiClient.post('/appointments', data);
export const updateAppointment = (id, data) => apiClient.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => apiClient.delete(`/appointments/${id}`);
export const approveAppointment = (id) => apiClient.patch(`/appointments/${id}/approve`);
export const rejectAppointment = (id, rejectionReason) =>
  apiClient.patch(`/appointments/${id}/reject`, { rejectionReason });
export const cancelAppointment = (id) => apiClient.patch(`/appointments/${id}/cancel`);
export const completeAppointment = (id) => apiClient.patch(`/appointments/${id}/complete`);
export const rateAppointment = (id, { rating, feedback }) =>
  apiClient.patch(`/appointments/${id}/rate`, { rating, feedback });
