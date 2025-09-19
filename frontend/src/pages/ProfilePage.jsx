import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield
} from 'lucide-react';
import { Layout } from '../components/common';
import { Card, Button, Input } from '../components/ui';
import { DEPARTMENTS, USER_YEARS, ROUTES, ANIMATIONS } from '../data';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Smith',
    email: 'john.smith@student.edu',
    phone: '+1 (555) 123-4567',
    department: 'Computer Science',
    year: '3rd Year',
    bio: 'Passionate computer science student interested in web development and artificial intelligence.',
    address: 'New York, NY',
    joinedDate: '2023-01-15'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const headerActions = !isEditing ? (
    <Button
      onClick={() => setIsEditing(true)}
      icon={<Edit className="h-4 w-4" />}
    >
      Edit Profile
    </Button>
  ) : (
    <div className="flex space-x-2">
      <Button
        onClick={handleSave}
        variant="success"
        icon={<Save className="h-4 w-4" />}
      >
        Save
      </Button>
      <Button
        onClick={handleCancel}
        variant="secondary"
        icon={<X className="h-4 w-4" />}
      >
        Cancel
      </Button>
    </div>
  );

  return (
    <Layout 
      headerTitle="My Profile"
      headerBackTo={ROUTES.DASHBOARD}
      headerActions={headerActions}
    >
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div 
            className="lg:col-span-1"
            {...ANIMATIONS.slideInFromLeft}
          >
            <Card className="text-center">
              {/* Profile Picture */}
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                  <User className="h-16 w-16" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{formData.name}</h2>
              <p className="text-gray-400 mb-1">{formData.department}</p>
              <p className="text-gray-500 text-sm">{formData.year}</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-gray-400">Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-xs text-gray-400">Rating</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Profile Details */}
          <motion.div 
            className="lg:col-span-2"
            {...ANIMATIONS.fadeInUp}
          >
            <Card>
              <h3 className="text-xl font-bold mb-6">Personal Information</h3>
              
              <div className="space-y-6">
                {/* Full Name */}
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  icon={<User className="h-4 w-4" />}
                  disabled={!isEditing}
                />

                {/* Email */}
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  icon={<Mail className="h-4 w-4" />}
                  disabled={!isEditing}
                />

                {/* Phone */}
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  icon={<Phone className="h-4 w-4" />}
                  disabled={!isEditing}
                />

                {/* Department & Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Shield className="inline h-4 w-4 mr-2" />
                      Department
                    </label>
                    {isEditing ? (
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
                      >
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-white bg-gray-800/50 px-4 py-3 rounded-lg">{formData.department}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Academic Year
                    </label>
                    {isEditing ? (
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
                      >
                        {USER_YEARS.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-white bg-gray-800/50 px-4 py-3 rounded-lg">{formData.year}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <Input
                  label="Address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  icon={<MapPin className="h-4 w-4" />}
                  disabled={!isEditing}
                />

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white resize-none"
                    />
                  ) : (
                    <p className="text-white bg-gray-800/50 px-4 py-3 rounded-lg">{formData.bio}</p>
                  )}
                </div>

                {/* Joined Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Member Since
                  </label>
                  <p className="text-white bg-gray-800/50 px-4 py-3 rounded-lg">
                    {new Date(formData.joinedDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
