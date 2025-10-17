import React, { useEffect, useState } from 'react';
import * as appointmentService from '../../api/appointmentService';
import AppointmentCard from '../../components/cards/AppointmentCard';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/common/Loader';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAppointments = (page = 1) => {
    setLoading(true);
    appointmentService
      .fetchAppointments({ page })
      .then(({ data }) => {
        setAppointments(data.data);
        setPagination(data.pagination);
      })
      .catch(() => setError('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="p-4 text-black">
      <h1 className="text-3xl mb-4 font-bold">Appointments</h1>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((appt) => <AppointmentCard key={appt._id} appointment={appt} />)
      )}
      <Pagination pagination={pagination} onPageChange={fetchAppointments} />
    </main>
  );
};

export default AppointmentList;
