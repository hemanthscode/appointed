import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as appointmentService from '../../api/appointmentService';
import Loader from '../../components/common/Loader';
import AppointmentCard from '../../components/cards/AppointmentCard';
import Button from '../../components/common/Button';
import { ArrowLeft } from 'lucide-react';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    setLoading(true);
    appointmentService.fetchAppointmentById(id)
      .then(({ data }) => setAppointment(data.data))
      .catch(() => setError('Failed to load appointment details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader className="mx-auto mt-20" size="xl" />;
  if (error) return <p className="text-red-600 text-center mt-6">{error}</p>;
  if (!appointment) return <p className="text-center mt-6">Appointment not found.</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto text-black">
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        onClick={() => navigate(-1)}
        ariaLabel="Go back"
      >
        <ArrowLeft className="inline w-5 h-5 mr-1" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-6 truncate">{appointment.subject}</h1>

      <AppointmentCard appointment={appointment} />

      {/* Detailed info */}
      <section className="bg-white border-2 border-black rounded-xl p-5 mt-6">
        <h2 className="text-xl font-bold mb-3">Details</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-black text-sm">
          <dt className="font-semibold">Date:</dt>
          <dd>{new Date(appointment.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</dd>

          <dt className="font-semibold">Time:</dt>
          <dd>{appointment.time}</dd>

          <dt className="font-semibold">Duration:</dt>
          <dd>{appointment.duration} minutes</dd>

          <dt className="font-semibold">Status:</dt>
          <dd className="capitalize">{appointment.status}</dd>

          <dt className="font-semibold">Message:</dt>
          <dd className="whitespace-pre-wrap">{appointment.message || 'No message provided.'}</dd>
        </dl>
      </section>
    </main>
  );
};

export default AppointmentDetails;
