import React, { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import { validateScheduleSlot } from '../../utils/validators';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'unavailable', label: 'Unavailable' },
];

const ScheduleForm = ({ initialData = {}, onSubmit, loading, onCancel }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    status: 'available',
    blockReason: '',
    ...initialData,
  });

  const [errors, setErrors] = useState({});

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
    const validation = validateScheduleSlot(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
      <Input
        label="Time"
        name="time"
        type="time"
        value={formData.time}
        onChange={handleChange}
        error={errors.time}
        required
        disabled={loading}
      />
      <Select
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={STATUS_OPTIONS}
        error={errors.status}
        required
        disabled={loading}
      />
      {formData.status === 'blocked' && (
        <Input
          label="Block Reason"
          name="blockReason"
          value={formData.blockReason}
          onChange={handleChange}
          error={errors.blockReason}
          disabled={loading}
          maxLength={100}
          required={formData.status === 'blocked'}
        />
      )}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>Save</Button>
      </div>
    </form>
  );
};

export default ScheduleForm;
