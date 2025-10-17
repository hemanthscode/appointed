import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { getToken, logout } from '../contexts/AuthContext';
import { sendRefreshToken } from '../api/authService';

export const useAuth = () => {
  const { notifyError } = useNotifications();
  const navigate = useNavigate();

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      const { data } = await sendRefreshToken(refreshToken);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data.token;
    } catch (err) {
      notifyError('Session expired. Please login again.');
      logout();
      navigate('/login');
      throw err;
    }
  };

  return {
    getToken,
    logout,
    refreshToken,
  };
};
