import React, { useState } from 'react';
import AppointmentForm from '../../components/forms/AppointmentForm';
import { useNavigate } from 'react-router-dom';
import * as appointmentService from '../../api/appointmentService';

const NewAppointment = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSave = async (formData) => {
    setLoading(true);
    setServerError('');
    try {
      await appointmentService.createAppointment(formData);
      navigate('/appointments');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 text-black">
      <h1 className="text-3xl font-bold mb-6">New Appointment</h1>
      <AppointmentForm onSubmit={handleSave} loading={loading} serverError={serverError} />
    </main>
  );
};

export default NewAppointment;
