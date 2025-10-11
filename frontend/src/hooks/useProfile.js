import { useState, useEffect } from 'react';
import {userService} from '../services';
import { useAuth } from '../contexts/AuthContext';

const useProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getProfile();
      setProfile(data.user);
      updateUserProfile(data.user);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateProfile = async (updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.updateProfile(updatedData);
      setProfile(data.user);
      updateUserProfile(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar: data.avatar, avatarUrl: data.avatarUrl }));
      updateUserProfile({ ...profile, avatar: data.avatar, avatarUrl: data.avatarUrl });
      return data;
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwords) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.changePassword(passwords);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
  };
};

export default useProfile
