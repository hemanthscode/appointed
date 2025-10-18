import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentForm from '../../components/forms/AppointmentForm';

const NewAppointment = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSave = async (formData) => {
    setLoading(true);
    setServerError('');
    try {
      const mod = await import('../../api/appointmentService');
      await mod.createAppointment(formData);
      navigate('/appointments');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 text-black">
      <h1 className="text-4xl font-bold mb-8">New Appointment</h1>
      <AppointmentForm onSubmit={handleSave} loading={loading} serverError={serverError} />
    </main>
  );
};

export default NewAppointment;
