import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/common';
import { Button, Badge, Modal } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

const statusColors = {
  active: 'bg-gray-700 text-white',
  pending: 'bg-yellow-600 text-white',
  suspended: 'bg-red-700 text-white',
  inactive: 'bg-gray-600 text-white',
};

const appointmentLabels = {
  academic_help: 'Academic Help',
  project_discussion: 'Project Discussion',
  career_guidance: 'Career Guidance',
  exam_preparation: 'Exam Preparation',
  research_guidance: 'Research Guidance',
  other: 'Other',
};

const ProfilePage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    office: '',
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const originalDataRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      const initialFormData = {
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        office: user.office || '',
      };
      setFormData(initialFormData);
      originalDataRef.current = initialFormData;
    }
  }, [user]);

  const hasChanges = () => {
    if (!originalDataRef.current) return true;
    return Object.keys(formData).some((key) => formData[key] !== originalDataRef.current[key]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChanges()) {
      toast.addToast('No changes detected to save.', 'info');
      setEditing(false);
      return;
    }
    try {
      const data = await userService.updateProfile(formData);
      updateUserProfile({
        ...data.user,
        appointments: user?.appointments || [],
      });
      originalDataRef.current = { ...formData };
      toast.addToast('Profile updated successfully', 'success');
      setEditing(false);
    } catch (error) {
      toast.addToast(error.message, 'error');
    }
  };

  if (!user) return <Layout><div className="text-white p-6">Loading profile...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-white font-sans space-y-12 bg-black rounded-md shadow-lg">
        {/* Header with Logout */}
        <section className="flex flex-col md:flex-row items-center md:items-start justify-between space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex items-center space-x-6">
            <div className="w-36 h-36 rounded-full bg-gray-700 flex items-center justify-center text-6xl font-semibold uppercase overflow-hidden">
              {user.avatar ? (
                <img src={`/uploads/avatars/${user.avatar}`} alt={`${user.name} avatar`} className="object-cover w-full h-full" />
              ) : (
                user.name.split(' ').map((n) => n[0]).join('')
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold">{user.name}</h1>
              <p className="text-lg font-semibold text-gray-300">{user.email}</p>
              <Badge className="inline-block mt-2" variant={user.status === 'active' ? 'success' : 'danger'}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
              {user.isVerified && <Badge className="ml-4" variant="success" size="small">Verified</Badge>}
            </div>
          </div>
          <Button variant="danger" className="self-start" onClick={() => setShowLogoutModal(true)} aria-label="Logout">
            Logout
          </Button>
        </section>

        {/* Info Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 font-semibold text-gray-300">
          <div>
            <h2 className="text-xl mb-1">Role</h2>
            <p>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>
          <div>
            <h2 className="text-xl mb-1">Department</h2>
            <p>{user.department}</p>
          </div>
          {user.role === 'student' && (
            <div>
              <h2 className="text-xl mb-1">Year</h2>
              <p>{user.year}</p>
            </div>
          )}
          {user.phone && (
            <div>
              <h2 className="text-xl mb-1">Phone</h2>
              <p>{user.phone}</p>
            </div>
          )}
          {user.address && (
            <div className="md:col-span-2">
              <h2 className="text-xl mb-1">Address</h2>
              <p>{user.address}</p>
            </div>
          )}
          {user.office && (
            <div className="md:col-span-2">
              <h2 className="text-xl mb-1">Office</h2>
              <p>{user.office}</p>
            </div>
          )}
        </section>

        {/* Bio Section */}
        {user.bio && (
          <section className="border border-gray-600 rounded-lg p-6 max-w-3xl bg-gray-900">
            <h2 className="text-2xl font-semibold mb-3">About Me</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{user.bio}</p>
          </section>
        )}

        {/* Edit Profile Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <Button variant="secondary" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          {editing && (
            <form onSubmit={handleUpdate} className="max-w-xl space-y-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-800 text-white focus:ring-2 focus:ring-white border border-gray-600"
                required
                placeholder="Full Name"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-800 text-white focus:ring-2 focus:ring-white border border-gray-600"
                placeholder="Phone"
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-800 text-white focus:ring-2 focus:ring-white border border-gray-600"
                placeholder="Address"
              />
              <input
                type="text"
                name="office"
                value={formData.office}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-800 text-white focus:ring-2 focus:ring-white border border-gray-600"
                placeholder="Office"
              />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 rounded bg-gray-800 text-white focus:ring-2 focus:ring-white border border-gray-600 resize-none"
                placeholder="Bio"
                maxLength={500}
              />
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </form>
          )}
        </section>

        {/* Appointments Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Appointments ({(user.appointments || []).length})</h2>
          {(!user.appointments || user.appointments.length === 0) ? (
            <p className="text-gray-400">No appointments found.</p>
          ) : (
            <ul className="space-y-4 max-w-4xl">
              {user.appointments.map(({ _id, formattedDate, time, purpose, status, isUpcoming }) => (
                <li
                  key={_id}
                  className={`border p-4 rounded-md flex justify-between items-center ${
                    isUpcoming ? 'bg-gray-700' : 'bg-gray-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white text-lg">{appointmentLabels[purpose] || 'Other'}</p>
                    <p className="text-gray-300">{formattedDate} at {time}</p>
                  </div>
                  <Badge
                    className="px-4 py-1 rounded-full uppercase text-sm font-semibold"
                    variant={
                      status === 'completed' ? 'success' :
                      status === 'confirmed' ? 'info' :
                      status === 'pending' ? 'warning' :
                      status === 'cancelled' ? 'danger' : 'info'
                    }
                  >
                    {status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Footer Section */}
        <section className="text-gray-400 text-sm space-y-2">
          <p>Joined on: {new Date(user.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>Last Login: {new Date(user.lastLogin).toLocaleString()}</p>
          {user.role === 'teacher' && <p>Rating: {user.rating} ({user.totalRatings} reviews)</p>}
          <p>Total Appointments: {user.appointmentsCount}</p>
        </section>

        {/* Logout Confirmation Modal */}
        <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Confirm Logout">
          <p>Are you sure you want to logout?</p>
          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                logout();
                toast.addToast('Logged out successfully.', 'success');
                setShowLogoutModal(false);
              }}
            >
              Logout
            </Button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default ProfilePage;
