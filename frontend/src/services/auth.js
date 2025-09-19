import { apiService } from './api';
import { safeParseJSON, safeStringifyJSON } from '../utils/helpers';

// Token management
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const REFRESH_TOKEN_KEY = 'refreshToken';

export class AuthService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    this.user = safeParseJSON(localStorage.getItem(USER_KEY));
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Set authentication data
  setAuth(token, user, refreshToken = null) {
    this.token = token;
    this.user = user;
    this.refreshToken = refreshToken;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, safeStringifyJSON(user));
    
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    // Set token in API client
    if (window.apiClient) {
      window.apiClient.setAuthToken(token);
    }
  }

  // Clear authentication data
  clearAuth() {
    this.token = null;
    this.user = null;
    this.refreshToken = null;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    // Clear token from API client
    if (window.apiClient) {
      window.apiClient.setAuthToken(null);
    }
  }

  // Login
  async login(credentials) {
    try {
      const response = await apiService.auth.login(credentials);
      const { token, user, refreshToken } = response.data;

      this.setAuth(token, user, refreshToken);
      
      return {
        success: true,
        data: { token, user, refreshToken }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await apiService.auth.register(userData);
      const { token, user, refreshToken } = response.data;

      this.setAuth(token, user, refreshToken);
      
      return {
        success: true,
        data: { token, user, refreshToken }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout
  async logout() {
    try {
      if (this.isAuthenticated()) {
        await apiService.auth.logout();
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error.message);
    } finally {
      this.clearAuth();
      return { success: true };
    }
  }

  // Refresh token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiService.auth.refreshToken();
      const { token, user } = response.data;

      this.setAuth(token, user, this.refreshToken);
      
      return {
        success: true,
        data: { token, user }
      };
    } catch (error) {
      // If refresh fails, clear auth data
      this.clearAuth();
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      await apiService.auth.forgotPassword(email);
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      await apiService.auth.resetPassword(token, password);
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.user?.role);
  }

  // Get user permissions (if implemented in backend)
  getPermissions() {
    return this.user?.permissions || [];
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }
}

// Create singleton instance
const authService = new AuthService();

// Initialize API client with existing token
if (authService.getToken() && window.apiClient) {
  window.apiClient.setAuthToken(authService.getToken());
}

export default authService;
