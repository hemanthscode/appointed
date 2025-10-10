import { useState } from 'react';
import userService from '../services/userService';

export default function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const user = await userService.updateProfile(data);
      setLoading(false);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
      throw err;
    }
  };

  const uploadAvatar = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.uploadAvatar(formData);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
      setLoading(false);
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      await userService.changePassword(currentPassword, newPassword);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      setLoading(false);
      throw err;
    }
  };

  return { loading, error, updateProfile, uploadAvatar, changePassword };
}
