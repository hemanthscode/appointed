import React, { useState, useEffect } from 'react';
import { Input, Select, Textarea, Button } from '../ui';
import { PURPOSES } from '../../utils/constants';
import { validateAppointment } from '../../utils/validators';
import { useTeachers } from '../../hooks';
import { useTimeSlots } from '../../hooks/useMetadata';

const AppointmentForm = ({ initialData = {}, onSubmit, loading, onCancel }) => {
  const [formData, setFormData] = useState({
    teacher: '',
    date: '',
    time: '',
    purpose: '',
    message: '',
    ...initialData,
  });
  const [errors, setErrors] = useState({});

  // Load teachers and time slots from hooks
  const { teachers, loading: teachersLoading } = useTeachers();
  const { timeSlots, loading: timeSlotsLoading } = useTimeSlots();

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...initialData }));
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validation = validateAppointment(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Select
        label="Teacher"
        name="teacher"
        value={formData.teacher}
        onChange={handleChange}
        options={teachers.map(t => ({ value: t._id, label: t.name }))}
        placeholder="Select Teacher"
        error={errors.teacher}
        required
        disabled={loading || teachersLoading}
      />
      <Input
        label="Date"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
        required
        disabled={loading}
      />
      <Select
        label="Time"
        name="time"
        value={formData.time}
        onChange={handleChange}
        options={timeSlots.map(slot => ({ value: slot, label: slot }))}
        placeholder="Select Time Slot"
        error={errors.time}
        required
        disabled={loading || timeSlotsLoading}
      />
      <Select
        label="Purpose"
        name="purpose"
        value={formData.purpose}
        onChange={handleChange}
        options={PURPOSES}
        placeholder="Select Purpose"
        error={errors.purpose}
        required
        disabled={loading}
      />
      <Textarea
        label="Message"
        name="message"
        value={formData.message}
        onChange={handleChange}
        error={errors.message}
        disabled={loading}
      />
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>Submit</Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
