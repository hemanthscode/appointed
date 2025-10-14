import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { safeParseJSON } from '../utils/helpers';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? safeParseJSON(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const loadUserFromStorage = useCallback(async () => {
    setLoading(true);
    const savedRefreshToken = localStorage.getItem('refreshToken');
    if (savedRefreshToken) {
      try {
        const refreshed = await authService.refreshToken(savedRefreshToken);
        localStorage.setItem('token', refreshed.token);
        localStorage.setItem('refreshToken', refreshed.refreshToken);

        const userObj = await userService.getProfile();
        if (!userObj || !userObj._id) throw new Error('Invalid user data received');

        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const login = async (credentials) => {
    setAuthLoading(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      const userObj = response.user;
      if (!userObj || !userObj._id) throw new Error('Invalid user data in login response');
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      setAuthLoading(false);
      return userObj;
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
  };

  const register = async (data) => {
    setAuthLoading(true);
    try {
      const response = await authService.register(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      const userObj = response.user;
      if (!userObj || !userObj._id) throw new Error('Invalid user data in register response');
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      setAuthLoading(false);
      return userObj;
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAuthLoading(false);
    }
  };

  // Token refresh every 14 minutes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;
      try {
        const refreshed = await authService.refreshToken(refreshToken);
        localStorage.setItem('token', refreshed.token);
        localStorage.setItem('refreshToken', refreshed.refreshToken);
        const userObj = await userService.getProfile();
        if (!userObj || !userObj._id) throw new Error('Invalid user data received');
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
      } catch (error) {
        console.error('Token refresh error:', error);
        if (error.message && error.message.includes('401')) logout();
      }
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, authLoading, login, register, logout, updateUserProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
