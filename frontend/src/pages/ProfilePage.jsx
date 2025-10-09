import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/common';
import { Card, Button, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { DEPARTMENTS, USER_YEARS, ROUTES } from '../data';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Shield } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        year: user.year || '',
        bio: user.bio || '',
        address: user.address || '',
        joinedDate: user.joinedDate || user.createdAt || '',
      });
    }
  }, [user]);

  if (loading || !formData) {
    return (
      <Layout headerTitle="My Profile" headerBackTo={ROUTES.DASHBOARD}>
        <p>Loading...</p>
      </Layout>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    const res = await updateProfile(formData);
    if (res.success) {
      setEditing(false);
    } else {
      alert(res.error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      year: user.year || '',
      bio: user.bio || '',
      address: user.address || '',
      joinedDate: user.joinedDate || user.createdAt || '',
    });
    setEditing(false);
  };

  const headerActions = editing ? (
    <>
      <Button onClick={handleSave} variant="success" loading={loading} disabled={loading} icon={<Save />}>
        Save
      </Button>
      <Button onClick={handleCancel} variant="secondary" disabled={loading} icon={<X />}>
        Cancel
      </Button>
    </>
  ) : (
    <Button onClick={() => setEditing(true)} icon={<Edit />}>
      Edit Profile
    </Button>
  );

  return (
    <Layout headerTitle="My Profile" headerBackTo={ROUTES.DASHBOARD} headerActions={headerActions}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture and Summary */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                  <User className="h-16 w-16" />
                </div>
                {editing && (
                  <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-white text-black p-2 rounded-full hover:bg-gray-100">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">{formData.name}</h2>
              <p className="text-gray-400 mb-1">{formData.department}</p>
              <p className="text-gray-500">{formData.year}</p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.appointmentsCount || 0}</p>
                  <p className="text-xs">Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.rating ?? 'N/A'}</p>
                  <p className="text-xs">Rating</p>
                </div>
              </div>
            </Card>
          </div>
          {/* Profile Details Form */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="mb-6 text-xl font-bold">Personal Information</h3>
              <div className="space-y-6">
                <Input name="name" label="Full Name" value={formData.name} onChange={handleChange} icon={<User />} disabled={!editing} />
                <Input name="email" label="Email" value={formData.email} onChange={handleChange} icon={<Mail />} disabled />
                <Input name="phone" label="Phone" value={formData.phone} onChange={handleChange} icon={<Phone />} disabled={!editing} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-300">
                      <Shield className="inline mr-2" /> Department
                    </label>
                    {editing ? (
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-700 rounded bg-gray-800 p-2 text-white">
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="p-2 bg-gray-800 rounded text-white">{formData.department}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-300">
                      <Calendar className="inline mr-2" /> Academic Year
                    </label>
                    {editing ? (
                      <select name="year" value={formData.year} onChange={handleChange} className="w-full border border-gray-700 rounded bg-gray-800 p-2 text-white">
                        {USER_YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="p-2 bg-gray-800 rounded text-white">{formData.year}</p>
                    )}
                  </div>
                </div>
                <Input name="address" label="Address" value={formData.address} onChange={handleChange} icon={<MapPin />} disabled={!editing} />
                <div>
                  <label className="block mb-2 font-medium text-gray-300">Bio</label>
                  {editing ? (
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="w-full border border-gray-700 rounded bg-gray-800 p-3 text-white resize-none" />
                  ) : (
                    <p className="p-3 bg-gray-800 rounded text-white">{formData.bio}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-300">Member Since</label>
                  <p className="p-3 rounded bg-gray-800 text-white">{formData.joinedDate ? new Date(formData.joinedDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
