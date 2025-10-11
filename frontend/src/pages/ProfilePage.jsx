import React, { useState } from 'react';
import { Layout } from '../components/common';
import { Card, Modal, Button, Badge } from '../components/ui';
import useProfile from '../hooks/useProfile';
import ProfileForm from '../components/ui/ProfileForm';
import { motion } from 'framer-motion';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'security', label: 'Security' },
];

const AppointmentList = ({ appointments }) => (
  <div>
    {appointments.length === 0 && (
      <p className="text-gray-500 italic">No appointments scheduled.</p>
    )}
    {appointments.map((appt) => (
      <Card key={appt._id} className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{appt.purpose.replace('-', ' ').toUpperCase()}</div>
            <div className="text-gray-400 text-sm">
              {appt.formattedDate} &bull; {appt.time}
            </div>
            <div className="text-gray-300 text-sm">
              Teacher: {appt.teacher?.name || 'Unknown'}
            </div>
          </div>
          <Badge
            variant={
              appt.status === 'confirmed'
                ? 'success'
                : appt.status === 'completed'
                ? 'primary'
                : appt.status === 'cancelled'
                ? 'danger'
                : appt.status === 'rejected'
                ? 'warning'
                : 'secondary'
            }
            size="medium"
          >
            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
          </Badge>
        </div>
      </Card>
    ))}
  </div>
);

const ProfileOverview = ({ user, onEdit }) => (
  <motion.section
    className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center space-x-6 mb-8">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 shadow-md">
        {user.avatar ? (
          <img
            src={user.avatarUrl || `/uploads/avatars/${user.avatar}`}
            alt="Avatar"
            className="object-cover w-full h-full"
            draggable={false}
          />
        ) : (
          <span className="block w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400 select-none">
            {user.name.charAt(0)}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white select-none">{user.name}</div>
        <div className="text-gray-400 select-text">{user.email}</div>
        <div className="text-gray-500 text-sm mt-1 select-none">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} &bull; {user.department}{' '}
          {user.year && (
            <>
              &bull; {user.year}
            </>
          )}
        </div>
      </div>
      <div className="ml-auto">
        <Button variant="primary" size="small" onClick={onEdit}>
          Edit Profile
        </Button>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
      {[
        { label: 'Phone', value: user.phone || '—' },
        { label: 'Address', value: user.address || '—' },
        { label: 'Bio', value: user.bio || '—', className: 'whitespace-pre-line' },
        { label: 'Office', value: user.office || '—' },
        { label: 'Status', value: <Badge variant={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge> },
        { label: 'Joined', value: new Date(user.joinedDate).toLocaleDateString() },
      ].map(({ label, value, className }, idx) => (
        <div key={idx}>
          <div className="mb-2 text-gray-400 font-medium">{label}</div>
          <div className={`text-white ${className || ''}`}>{value}</div>
        </div>
      ))}
    </div>
  </motion.section>
);

const ProfilePage = () => {
  const { profile: user, loading, error, updateProfile, uploadAvatar, changePassword } = useProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Control modals exclusively
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const openEditModal = () => {
    setEditModalOpen(true);
    setPasswordModalOpen(false);
  };

  const openPasswordModal = () => {
    setPasswordModalOpen(true);
    setEditModalOpen(false);
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setPasswordModalOpen(false);
  };

  const handleSave = async (data) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      await updateProfile(data);
      setFormSuccess('Profile updated successfully.');
      closeModals();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleAvatarUpload = async (file) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      await uploadAvatar(file);
      setFormSuccess('Avatar updated successfully.');
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handlePasswordChange = async (passwordData) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      await changePassword(passwordData);
      setFormSuccess('Password changed successfully.');
      closeModals();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pt-12 px-4 sm:px-6">
        <Card className="p-0 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
          {/* Tabs */}
          <nav className="flex border-b border-gray-800">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-4 text-center font-medium text-lg focus:outline-none transition-colors ${
                  activeTab === key
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-blue-300'
                }`}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="p-6">
            {loading && <div className="text-gray-400 my-12 text-center">Loading...</div>}
            {error && <div className="mb-4 text-red-500 font-semibold">{error}</div>}
            {formError && <div className="mb-4 text-red-500 font-semibold">{formError}</div>}
            {formSuccess && <div className="mb-4 text-green-500 font-semibold">{formSuccess}</div>}

            {activeTab === 'overview' && user && (
              <ProfileOverview user={user} onEdit={openEditModal} />
            )}

            {activeTab === 'appointments' && user && (
              <AppointmentList appointments={user.appointments || []} />
            )}

            {activeTab === 'security' && (
              <motion.section
                className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex flex-col items-start gap-6">
                  <div>
                    <span className="font-medium text-gray-300 mr-2 select-none">Account Status:</span>
                    <Badge variant={user?.status === 'active' ? 'success' : 'danger'}>
                      {user?.status}
                    </Badge>
                  </div>
                  <Button variant="danger" onClick={openPasswordModal} size="medium">
                    Change Password
                  </Button>
                </div>
              </motion.section>
            )}
          </div>

          {/* Modals */}
          <Modal isOpen={editModalOpen} onClose={closeModals} title="Edit Profile" size="full" showCloseButton>
            <ProfileForm
              profile={user}
              loading={loading}
              onSave={handleSave}
              onAvatarUpload={handleAvatarUpload}
              hidePassword
              onCancel={closeModals}
            />
          </Modal>

          <Modal isOpen={passwordModalOpen} onClose={closeModals} title="Change Password" size="small" showCloseButton>
            <ProfileForm
              profile={user}
              loading={loading}
              onChangePassword={handlePasswordChange}
              passwordOnly
              onCancel={closeModals}
            />
          </Modal>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
