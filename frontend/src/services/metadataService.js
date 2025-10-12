import apiService from './apiService';

const getDepartments = async () => {
  const data = await apiService.request('/metadata/departments');
  return data.departments || data.data?.departments || [];
};

const getSubjects = async (department) => {
  const data = await apiService.request(`/metadata/subjects?department=${encodeURIComponent(department)}`);
  return data.subjects || data.data?.subjects || [];
};

const getTimeSlots = async () => {
  const data = await apiService.request('/metadata/time-slots');
  return data.timeSlots || data.data?.timeSlots || [];
};

const getAppointmentPurposes = async () => {
  const data = await apiService.request('/metadata/appointment-purposes');
  return data.purposes || data.data?.purposes || [];
};

const getUserYears = async () => {
  const data = await apiService.request('/metadata/user-years');
  return data.years || data.data?.years || [];
};

export default {
  getDepartments,
  getSubjects,
  getTimeSlots,
  getAppointmentPurposes,
  getUserYears,
};
