import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as appointmentService from '../../api/appointmentService';
import Loader from '../../components/common/Loader';
import AppointmentCard from '../../components/cards/AppointmentCard';

const AppointmentDetails = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    appointmentService
      .fetchAppointmentById(id)
      .then(({ data }) => setAppointment(data.data))
      .catch(() => setError('Failed to load appointment details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!appointment) return <p>Appointment not found.</p>;

  return (
    <main className="p-4 text-black">
      <h1 className="text-3xl mb-4 font-bold">Appointment Details</h1>
      <AppointmentCard appointment={appointment} />
      {/* Additional details can be displayed here as needed */}
    </main>
  );
};

export default AppointmentDetails;
