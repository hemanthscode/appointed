import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MessageSquare, User } from 'lucide-react';
import { Layout } from '../components/common';
import { Card, Button, Input, Select, Textarea } from '../components/ui';
import { useApi } from '../hooks';
import { apiService } from '../services';
import { ROUTES, ANIMATIONS } from '../data';

const AppointmentPage = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams();

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    purpose: '',
    message: ''
  });

  // Fetch teacher data using API
  const { data: teacher } = useApi(() => apiService.users.getUserById(teacherId), [teacherId]);

  const { data: appointmentPurposes } = useApi(() => apiService.metadata.getAppointmentPurposes(), []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({ ...prev, time }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiService.appointments.create({
        teacherId,
        date: formData.date,
        time: formData.time,
        purpose: formData.purpose,
        message: formData.message
      });
      navigate(ROUTES.APPOINTMENTS);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      // Optionally show error feedback
    }
  };

  if (!teacher) return <div>Loading...</div>;

  return (
    <Layout
      headerTitle="Book Appointment"
      headerBackTo={ROUTES.TEACHERS}
    >
      <div className="p-6 max-w-2xl mx-auto">
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

        <motion.div {...ANIMATIONS.fadeInUp} style={{ transitionDelay: '0.2s' }}>
          <Card>
            <h3 className="text-xl font-bold mb-6">Appointment Details</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Select Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                icon={<Calendar className="h-4 w-4" />}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
                  ].map((slot) => (
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Purpose of Appointment
                </label>
                <Select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  options={appointmentPurposes?.map(p => ({ value: p.value, label: p.label })) || []}
                  placeholder="Select purpose"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-2" />
                  Additional Message
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe what you'd like to discuss..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="large" className="flex-1">
                  Book Appointment
                </Button>
                <Button type="button" size="large" variant="secondary" className="flex-1" onClick={() => navigate(ROUTES.TEACHERS)}>
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
