import apiService from './apiService';

const getAppointments = (params) =>
  apiService.request(`/appointments?${new URLSearchParams(params).toString()}`);

const getAppointment = (id) => apiService.request(`/appointments/${id}`);

const createAppointment = (data) =>
  apiService.request('/appointments', { method: 'POST', body: data });

const updateAppointment = (id, data) =>
  apiService.request(`/appointments/${id}`, { method: 'PUT', body: data });

const approveAppointment = (id) =>
  apiService.request(`/appointments/${id}/approve`, { method: 'PATCH' });

const rejectAppointment = (id) =>
  apiService.request(`/appointments/${id}/reject`, { method: 'PATCH' });

const cancelAppointment = (id) =>
  apiService.request(`/appointments/${id}/cancel`, { method: 'PATCH' });

const completeAppointment = (id) =>
  apiService.request(`/appointments/${id}/complete`, { method: 'PATCH' });

const rateAppointment = (id, data) =>
  apiService.request(`/appointments/${id}/rate`, { method: 'PATCH', body: data });

const deleteAppointment = (id) =>
  apiService.request(`/appointments/${id}`, { method: 'DELETE' });

export default {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  rateAppointment,
  deleteAppointment,
};
