import apiService from './apiService';

export const getAppointments = (params) => apiService.request('/appointments', { method: 'GET', params });
export const createAppointment = (body) => apiService.request('/appointments', { method: 'POST', body });
export const getAppointment = (id) => apiService.request(`/appointments/${id}`, { method: 'GET' });
export const updateAppointment = (id, body) => apiService.request(`/appointments/${id}`, { method: 'PUT', body });
export const deleteAppointment = (id) => apiService.request(`/appointments/${id}`, { method: 'DELETE' });

export const approveAppointment = (id) => apiService.request(`/appointments/${id}/approve`, { method: 'PATCH' });
export const rejectAppointment = (id) => apiService.request(`/appointments/${id}/reject`, { method: 'PATCH' });
export const cancelAppointment = (id) => apiService.request(`/appointments/${id}/cancel`, { method: 'PATCH' });
export const completeAppointment = (id) => apiService.request(`/appointments/${id}/complete`, { method: 'PATCH' });
export const rateAppointment = (id, body) => apiService.request(`/appointments/${id}/rate`, { method: 'PATCH', body });

export default {
  getAppointments,
  createAppointment,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  rateAppointment,
};
