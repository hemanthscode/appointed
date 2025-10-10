import React, { useState } from 'react';
import { Layout } from '../components/common';
import AppointmentCard from '../components/cards/AppointmentCard';
import useAppointments from '../hooks/useAppointments';
import { Button } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import appointmentService from '../services/appointmentService';

const RequestsPage = () => {
  const toast = useToast();
  const [filters, setFilters] = useState({ status: 'pending', page: 1, limit: 10 });
  const { appointments, loading, error, reload, pagination } = useAppointments(filters);

  const handleRequestAction = async (action, id) => {
    try {
      switch (action) {
        case 'approve':
          await appointmentService.approveAppointment(id);
          toast.addToast('Appointment approved', 'success');
          break;
        case 'reject':
          await appointmentService.rejectAppointment(id);
          toast.addToast('Appointment rejected', 'warning');
          break;
        default:
          toast.addToast('Invalid action', 'error');
          break;
      }
      reload();
    } catch {
      toast.addToast('Action failed', 'error');
    }
  };

  const onPageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (error) return <Layout><div className="p-6 text-red-500">Failed to load requests.</div></Layout>;

  return (
    <Layout headerTitle="Appointment Requests">
      <section className="max-w-5xl mx-auto p-6 space-y-6 text-white">
        {loading ? (
          <p>Loading requests...</p>
        ) : appointments.length === 0 ? (
          <p>No appointment requests.</p>
        ) : (
          <ul className="space-y-4">
            {appointments.map((appointment, i) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                index={i}
                onAction={(action) => handleRequestAction(action, appointment.id)}
              />
            ))}
          </ul>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <Button variant="secondary" disabled={filters.page <= 1} onClick={() => onPageChange(filters.page - 1)}>
              Previous
            </Button>
            <span className="self-center">
              Page {filters.page} of {pagination.totalPages}
            </span>
            <Button variant="secondary" disabled={filters.page >= pagination.totalPages} onClick={() => onPageChange(filters.page + 1)}>
              Next
            </Button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default RequestsPage;
