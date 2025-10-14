import React, { useState } from 'react';
import { Layout } from '../components/common';
import { Card, Badge, Button, Modal, AvatarUpload } from '../components/ui';
import useProfile from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ProfileForm from '../components/forms/ProfileForm';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    changePassword,
  } = useProfile();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const handleSave = async (data) => {
    try {
      await updateProfile(data);
      toast.addToast('Profile updated successfully.', 'success', 2000);
      setEditModalOpen(false);
    } catch (err) {
      toast.addToast(err.message || 'Failed to update profile.', 'error', 2000);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      await uploadAvatar(file);
      toast.addToast('Avatar updated successfully.', 'success', 2000);
    } catch (err) {
      toast.addToast(err.message || 'Avatar upload failed.', 'error', 2000);
    }
  };

  const handlePasswordChange = async (passwords) => {
    try {
      await changePassword(passwords);
      toast.addToast('Password changed successfully.', 'success', 2000);
      setPasswordModalOpen(false);
    } catch (err) {
      toast.addToast(err.message || 'Password change failed.', 'error', 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.addToast('Logged out successfully.', 'success', 2000);
    } catch {
      toast.addToast('Logout failed.', 'error', 2000);
    }
  };

  if (loading)
    return (
      <Layout headerTitle="My Profile">
        <p className="p-12 text-center text-white text-lg">Loading profile...</p>
      </Layout>
    );

  if (error)
    return (
      <Layout headerTitle="My Profile">
        <p className="p-12 text-center text-red-500 text-lg">Error: {error}</p>
      </Layout>
    );

  if (!profile)
    return (
      <Layout headerTitle="My Profile">
        <p className="p-12 text-center text-white text-lg">No profile data available.</p>
      </Layout>
    );

  return (
    <Layout headerTitle="My Profile">
      <div className="max-w-5xl mx-auto h-full p-8 text-white flex flex-col md:flex-row gap-12 select-none min-h-[80vh]">
        {/* LEFT: Avatar & Basics */}
        <Card className="w-full md:w-1/3 flex flex-col items-center justify-center space-y-8 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 shadow-lg">
          <AvatarUpload
            currentAvatar={profile.avatarUrl || profile.avatar}
            onFileSelect={handleAvatarUpload}
            disabled={loading}
          />
          <h2 className="text-3xl font-bold">{profile.name || user?.name || 'User'}</h2>
          <p className="text-gray-400">{profile.email || user?.email}</p>
          <Badge
            variant={profile.status === 'active' ? 'success' : 'danger'}
            className="uppercase tracking-wider"
          >
            {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) || 'User'}
          </Badge>

          <div className="w-full space-y-3">
            <Button variant="primary" fullWidth onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
            <Button variant="secondary" fullWidth onClick={() => window.location.href = '/teachers'}>
              Teachers List
            </Button>
            <Button variant="danger" fullWidth onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Card>

        {/* RIGHT: Info & Actions */}
        <div className="w-full md:w-2/3 flex flex-col justify-between h-full">
          <Card className="bg-gray-900 rounded-3xl p-6 shadow-lg overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-6">Profile Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <span className="font-semibold text-gray-400">Department:</span>
                <p>{profile.department || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Year:</span>
                <p>{profile.year || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Phone:</span>
                <p>{profile.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Address:</span>
                <p>{profile.address || 'N/A'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-400">Bio:</span>
                <p className="whitespace-pre-wrap">{profile.bio || 'No biography provided.'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Office:</span>
                <p>{profile.office || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Joined On:</span>
                <p>{profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Last Login:</span>
                <p>{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-start">
              <Button variant="primary" onClick={() => setEditModalOpen(true)}>
                Edit Profile
              </Button>

              <Button variant="secondary" onClick={() => setPasswordModalOpen(true)}>
                Change Password
              </Button>

              <Button
                variant="warning"
                onClick={() => (window.location.href = '/forgot-password')}
              >
                Forgot Password
              </Button>

              <Button
                variant="secondary"
                onClick={() => window.location.href = '/appointments'}
              >
                My Appointments
              </Button>

              <Button
                variant="secondary"
                onClick={() => window.location.href = '/messages'}
              >
                Messages
              </Button>
            </div>
          </Card>
        </div>

        {/* PROFILE EDIT MODAL */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Profile"
          size="full"
          showCloseButton
        >
          <ProfileForm
            profile={profile}
            loading={loading}
            onSave={handleSave}
            onAvatarUpload={handleAvatarUpload}
            hidePassword
            onCancel={() => setEditModalOpen(false)}
          />
        </Modal>

        {/* CHANGE PASSWORD MODAL */}
        <Modal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          title="Change Password"
          size="small"
          showCloseButton
        >
          <ProfileForm
            profile={profile}
            loading={loading}
            onChangePassword={handlePasswordChange}
            passwordOnly
            onCancel={() => setPasswordModalOpen(false)}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default ProfilePage;
