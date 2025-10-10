import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {authService,userService} from '../services';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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

        const profileData = await userService.getProfile();
        setUser(profileData.user);
        localStorage.setItem('user', JSON.stringify(profileData.user));
      } catch {
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

      const profileData = await userService.getProfile();
      setUser(profileData.user);
      localStorage.setItem('user', JSON.stringify(profileData.user));

      setAuthLoading(false);
      return profileData.user;
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

      const profileData = await userService.getProfile();
      setUser(profileData.user);
      localStorage.setItem('user', JSON.stringify(profileData.user));

      setAuthLoading(false);
      return profileData.user;
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;

      try {
        const refreshed = await authService.refreshToken(refreshToken);
        localStorage.setItem('token', refreshed.token);
        localStorage.setItem('refreshToken', refreshed.refreshToken);

        const profileData = await userService.getProfile();
        setUser(profileData.user);
        localStorage.setItem('user', JSON.stringify(profileData.user));
      } catch {
        logout();
      }
    }, 14 * 60 * 1000); // 14 minutes

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
