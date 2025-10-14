import React, { useState, useEffect, useRef } from 'react';
import { Input, Select, Textarea, Button } from '../ui';
import { PURPOSES } from '../../utils/constants';
import { validateAppointment } from '../../utils/validators';
import useTeachers from '../../hooks/useTeachers';
import { useTimeSlots } from '../../hooks/useMetadata';

const shallowEqual = (obj1, obj2) => {
  if (!obj1 || !obj2) return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => obj1[key] === obj2[key]);
};

const AppointmentForm = ({ initialData = {}, onSubmit, loading = false, onCancel }) => {
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    date: '',
    time: '',
    purpose: '',
    message: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const prevInitialData = useRef(initialData);

  const { teachers = [], loading: teachersLoading } = useTeachers();
  const { timeSlots = [], loading: timeSlotsLoading } = useTimeSlots();

  useEffect(() => {
    if (!shallowEqual(initialData, prevInitialData.current)) {
      setFormData(prev => ({ ...prev, ...initialData }));
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateAppointment(formData);
    const updatedErrors = { ...validation.errors };

    // Subject is required when purpose involves academic or project help
    if (!formData.subject?.trim()) {
      updatedErrors.subject = 'Subject is required';
    }

    if (Object.keys(updatedErrors).length > 0) {
      setErrors(updatedErrors);
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
        label="Subject"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder="Enter Subject"
        error={errors.subject}
        required
        disabled={loading}
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
        placeholder="Add a note or question (optional)"
        error={errors.message}
        disabled={loading}
        maxLength={500}
      />
      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
