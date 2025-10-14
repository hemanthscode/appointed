import apiService from './apiService';

const login = async (credentials) => {
  const response = await apiService.request('/auth/login', {
    method: 'POST',
    body: credentials,
  });

  return {
    user: response.user,
    token: response.token,
    refreshToken: response.refreshToken,
  };
};

const register = async (userData) => {
  const payload = { ...userData };
  if (payload.year === '') delete payload.year;
  if (payload.subject === '') delete payload.subject;

  const response = await apiService.request('/auth/register', {
    method: 'POST',
    body: payload,
  });

  return {
    user: response.user,
    token: response.token,
    refreshToken: response.refreshToken,
  };
};

const logout = async () => {
  await apiService.request('/auth/logout', { method: 'POST' });
};

const refreshToken = async (refreshToken) => {
  const response = await apiService.request('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });

  return {
    user: response.user,
    token: response.token,
    refreshToken: response.refreshToken,
  };
};

const forgotPassword = async (email) => {
  return apiService.request('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
};

const resetPassword = async (token, password) => {
  return apiService.request('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
};

export default {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};
