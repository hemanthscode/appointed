import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MessageSquare, User } from 'lucide-react';
import { Layout } from '../components/common';
import { Card, Button, Input } from '../components/ui';
import { TEACHERS, TIME_SLOTS, APPOINTMENT_PURPOSES, ROUTES, ANIMATIONS } from '../data';

const AppointmentPage = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    purpose: '',
    message: ''
  });

  // Find teacher by ID
  const teacher = TEACHERS.find(t => t.id === parseInt(teacherId)) || TEACHERS[0];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTimeSelect = (time) => {
    setFormData({...formData, time});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle appointment booking logic
    console.log('Appointment booked:', { teacher: teacher.id, ...formData });
    navigate(ROUTES.APPOINTMENTS);
  };

  return (
    <Layout 
      headerTitle="Book Appointment"
      headerBackTo={ROUTES.TEACHERS}
    >
      <div className="p-6 max-w-2xl mx-auto">
        {/* Teacher Info */}
        <motion.div {...ANIMATIONS.fadeInUp}>
          <Card className="mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{teacher.name}</h2>
                <p className="text-gray-400">{teacher.department}</p>
                <p className="text-sm text-gray-300">{teacher.subject}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Booking Form */}
        <motion.div 
          {...ANIMATIONS.fadeInUp}
          style={{ transitionDelay: '0.2s' }}
        >
          <Card>
            <h3 className="text-xl font-bold mb-6">Appointment Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <Input
                label="Select Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                icon={<Calendar className="h-4 w-4" />}
                required
              />

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <Button
                      key={slot}
                      type="button"
                      variant={formData.time === slot ? "primary" : "secondary"}
                      size="small"
                      onClick={() => handleTimeSelect(slot)}
                      className="text-sm"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Purpose of Appointment
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
                  required
                >
                  <option value="">Select purpose</option>
                  {APPOINTMENT_PURPOSES.map(purpose => (
                    <option key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-2" />
                  Additional Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe what you'd like to discuss..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  size="large"
                  className="flex-1"
                >
                  Book Appointment
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={() => navigate(ROUTES.TEACHERS)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AppointmentPage;
