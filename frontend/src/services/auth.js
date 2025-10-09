import { apiService } from './api';
import { safeParseJSON, safeStringifyJSON } from '../utils/helpers';

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

class AuthService {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    try {
      this.token = localStorage.getItem(TOKEN_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      this.user = safeParseJSON(userStr);
    } catch (e) {
      console.error('[AuthService] Error reading from localStorage:', e);
      this.clearAuth();
    }

    if (this.token && window.apiClient) {
      window.apiClient.setAuthToken(this.token);
    }
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  setAuth(token, user, refreshToken = null) {
    this.token = token;
    this.user = user;
    this.refreshToken = refreshToken;

    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, safeStringifyJSON(user));
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (e) {
      console.error('[AuthService] Error writing to localStorage:', e);
    }

    if (window.apiClient) {
      window.apiClient.setAuthToken(token);
    }
  }

  clearAuth() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('[AuthService] Error clearing localStorage:', e);
    }

    if (window.apiClient) {
      window.apiClient.setAuthToken(null);
    }
  }

  async login(credentials) {
    try {
      const response = await apiService.auth.login(credentials);
      const { token, user, refreshToken } = response.data.data;
      this.setAuth(token, user, refreshToken);
      return { success: true, data: { token, user, refreshToken } };
    } catch (error) {
      console.error('[AuthService] login error:', error);
      return { success: false, error: error.message || error.toString() };
    }
  }

  async register(userData) {
    try {
      const response = await apiService.auth.register(userData);
      const { token, user, refreshToken } = response.data.data;
      this.setAuth(token, user, refreshToken);
      return { success: true, data: { token, user, refreshToken } };
    } catch (error) {
      console.error('[AuthService] register error:', error);
      return { success: false, error: error.message || error.toString() };
    }
  }

  async logout() {
    try {
      if (this.isAuthenticated()) {
        await apiService.auth.logout();
      }
    } catch (error) {
      console.warn('[AuthService] logout API error:', error.message || error.toString());
    } finally {
      this.clearAuth();
      return { success: true };
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    try {
      const response = await apiService.auth.refreshToken();
      const { token, user } = response.data.data;
      this.setAuth(token, user, this.refreshToken);
      return { success: true, data: { token, user } };
    } catch (error) {
      this.clearAuth();
      console.error('[AuthService] refreshAccessToken error:', error);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
export { AuthService };
