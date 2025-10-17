import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const notifyErrorGlobal = (msg) => {
  if (typeof window !== 'undefined') toast.error(msg);
  else console.error('API Error:', msg);
};

// Attach token before each request
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage for every request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints
    if (originalRequest.url?.includes('/auth/register') || 
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Only handle refresh once per request
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      const storedRefresh = localStorage.getItem('refreshToken');
      
      if (!storedRefresh) {
        // No refresh token available, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/refresh`,
          { refreshToken: storedRefresh },
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const newAccessToken = data.data?.token || data.token;
        const newRefreshToken = data.data?.refreshToken || data.refreshToken;

        if (!newAccessToken) {
          throw new Error('No access token received from refresh');
        }

        // Update tokens
        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update default headers
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Network error';
    notifyErrorGlobal(errorMessage);
    return Promise.reject(error);
  }
);

export default apiClient;