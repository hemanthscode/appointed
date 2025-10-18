import React, { useState, useEffect } from 'react';
import * as appointmentService from '../../api/appointmentService';
import AppointmentCard from '../../components/cards/AppointmentCard';
import Loader from '../../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Rejected', value: 'rejected' },
];

const AppointmentList = () => {
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    import('../../api/userService').then(({ getProfile }) => {
      getProfile()
        .then(({ data }) => setUserRole(data.data.role))
        .catch(() => setUserRole('guest'));
    });
  }, []);

  useEffect(() => {
    const fetchAllAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        // Use 'all=true' to fetch without pagination (backend supports this)
        const { data } = await appointmentService.fetchAppointments({ all: true });
        setAllAppointments(data.data);
        setFilteredAppointments(data.data);
      } catch (e) {
        setError('Failed to load appointments');
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAllAppointments();
  }, []);

  // Client-side filter by status
  useEffect(() => {
    if (!statusFilter) {
      setFilteredAppointments(allAppointments);
    } else {
      setFilteredAppointments(allAppointments.filter((appt) => appt.status === statusFilter));
    }
  }, [statusFilter, allAppointments]);

  return (
    <main className="max-w-6xl mx-auto p-6 text-black">
      <h1 className="text-4xl font-bold mb-6">Appointments</h1>

      {/* Status Tabs */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {STATUS_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-2 rounded-full border-2 border-black font-semibold transition ${
              value === statusFilter ? 'bg-black text-white' : 'bg-white text-black'
            }`}
            aria-pressed={value === statusFilter}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader size="xl" />
        </div>
      )}

      {error && <p className="text-red-600 text-center mb-6">{error}</p>}

      {!loading && filteredAppointments.length === 0 && (
        <p className="text-center text-gray-600 text-xl">No appointments found for the selected status.</p>
      )}

      <div className="space-y-6">
        {!loading &&
          filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              userRole={userRole}
              onClick={() => navigate(`/appointments/${appt._id}`)}
              // You can supply action handlers here (approve, reject, etc.)
            />
          ))}
      </div>
    </main>
  );
};

export default AppointmentList;
