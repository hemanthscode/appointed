import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as authService from '../api/authService';
import { toast } from 'react-toastify';  // <-- import toast from toast library
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common.Authorization;
    authService.logout().catch(() => {});
  }, []);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.getMe();
      setUser(data.data || data.user);
    } catch (err) {
      console.error('Failed to load user:', err);
      toast.error('Session expired. Please login again.');
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [token, handleLogout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    try {
      const { data } = await authService.login(credentials);
      const responseData = data.data || data;
      const { token: accessToken, refreshToken: newRefreshToken, user: userData } = responseData;

      if (userData.status === 'pending') {
        toast.error('Your account is pending approval. Please wait for admin verification.');
        return { success: false, status: 'pending' };
      }

      if (userData.status === 'inactive') {
        toast.error('Your account has been deactivated. Please contact support.');
        return { success: false, status: 'inactive' };
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      setToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);

      toast.success('Login successful!');
      return { success: true, status: userData.status };
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await authService.register(userData);
      const responseData = data.data || data;
      const { user: newUser } = responseData;

      // No token stored since waiting for admin approval
      toast.success('Registration successful! Please wait for admin approval.');

      return {
        success: true,
        user: newUser,
        status: newUser.status,
        requiresApproval: newUser.status === 'pending'
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout: handleLogout,
    register,
    refreshToken,
    setToken,
    setRefreshToken,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Helpers for non-hook files
export const getToken = () => localStorage.getItem('token');
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  delete apiClient.defaults.headers.common.Authorization;
};

export default AuthContext;
