import apiService from './apiService';

const login = async (credentials) => {
  const data = await apiService.request('/auth/login', {
    method: 'POST',
    body: credentials,
  });

  return {
    user: data.user,
    token: data.token,
    refreshToken: data.refreshToken,
  };
};

const register = async (userData) => {
  // Clean optional empty fields before sending to backend
  const payload = { ...userData };
  if (payload.year === '') delete payload.year;
  if (payload.subject === '') delete payload.subject;

  const data = await apiService.request('/auth/register', {
    method: 'POST',
    body: payload,
  });

  return {
    user: data.user,
    token: data.token,
    refreshToken: data.refreshToken,
  };
};

const logout = async () => {
  await apiService.request('/auth/logout', { method: 'POST' });
};

const refreshToken = async (refreshToken) => {
  const data = await apiService.request('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });

  return {
    user: data.user,
    token: data.token,
    refreshToken: data.refreshToken,
  };
};

export default {
  login,
  register,
  logout,
  refreshToken,
};
