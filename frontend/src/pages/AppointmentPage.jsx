import React, { useEffect, useState } from 'react';
import { Layout } from '../components/common';
import { Card, Button, Select, Input, Textarea } from '../components/ui';
import useMetadata from '../hooks/useMetadata';
import appointmentService from '../services/appointmentService';
import { useToast } from '../contexts/ToastContext';

const AppointmentPage = () => {
  const toast = useToast();
  const { departments, subjects, timeSlots, appointmentPurposes, fetchSubjectsByDepartment, loading: loadingMeta } = useMetadata();

  const [formData, setFormData] = useState({
    department: '',
    subject: '',
    date: '',
    time: '',
    purpose: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]);

  useEffect(() => {
    if (formData.department) {
      fetchSubjectsByDepartment(formData.department).then(setSubjectOptions);
    } else {
      setSubjectOptions([]);
    }
  }, [formData.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await appointmentService.createAppointment(formData);
      toast.addToast('Appointment created successfully.', 'success');
      setFormData({
        department: '',
        subject: '',
        date: '',
        time: '',
        purpose: '',
        message: '',
      });
    } catch (error) {
      toast.addToast(error.message || 'Failed to create appointment.', 'error');
    }
    setLoading(false);
  };

  return (
    <Layout headerTitle="Create Appointment">
      <section className="max-w-md mx-auto p-6 bg-black rounded-md text-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={[{ value: '', label: 'Select Department' }, ...departments.map((d) => ({ value: d, label: d }))]}
            required
            disabled={loadingMeta}
          />
          <Select
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            options={[{ value: '', label: 'Select Subject' }, ...subjectOptions.map((s) => ({ value: s, label: s }))]}
            required
            disabled={loadingMeta || !formData.department}
          />
          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <Select
            label="Time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            options={[{ value: '', label: 'Select Time Slot' }, ...timeSlots.map((t) => ({ value: t, label: t }))]}
            required
            disabled={loadingMeta}
          />
          <Select
            label="Purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            options={[{ value: '', label: 'Select Purpose' }, ...appointmentPurposes.map((p) => ({ value: p.value, label: p.label }))]}
            required
            disabled={loadingMeta}
          />
          <Textarea
            label="Additional Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter any additional details (optional)"
            rows={3}
          />
          <Button type="submit" variant="primary" fullWidth loading={loading} disabled={loading}>
            Create Appointment
          </Button>
        </form>
      </section>
    </Layout>
  );
};

export default AppointmentPage;
