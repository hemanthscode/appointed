import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

const useProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userObj = await userService.getProfile();
      setProfile(userObj);
      updateUserProfile(userObj);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      console.error('Load profile error:', err);
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
      const userObj = await userService.updateProfile(updatedData);
      setProfile(userObj);
      updateUserProfile(userObj);
      return userObj;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Update profile error:', err);
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
      const updatedProfile = { ...profile, avatar: data.avatar, avatarUrl: data.avatarUrl };
      setProfile(updatedProfile);
      updateUserProfile(updatedProfile);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
      console.error('Upload avatar error:', err);
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
      console.error('Change password error:', err);
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

export default useProfile;
