import React, { useState } from 'react';
import { Layout } from '../components/common';
import AppointmentCard from '../components/cards/AppointmentCard';
import AppointmentForm from '../components/forms/AppointmentForm';
import { Card, Modal, Pagination } from '../components/ui';
import useAppointments from '../hooks/useAppointments';
import useAuth from '../hooks/useAuth';
import appointmentService from '../services/appointmentService';

const AppointmentsPage = () => {
  const { appointments, pagination, loading, error, refresh } = useAppointments();
  const { user } = useAuth();
  const userRole = user?.role || null;
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const openCreateModal = () => {
    setSelectedAppointment(null);
    setCreateModalOpen(true);
    setEditModalOpen(false);
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
    setCreateModalOpen(false);
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setCreateModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleSubmit = async (data) => {
    setActionError(null);
    setActionLoading(true);
    try {
      if (selectedAppointment) {
        await appointmentService.updateAppointment(selectedAppointment._id, data);
      } else {
        await appointmentService.createAppointment(data);
      }
      await refresh();
      closeModals();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (id, actionFn) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await actionFn(id);
      await refresh();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <button onClick={openCreateModal} className="btn btn-primary">
            New Appointment
          </button>
        </div>

        {error && <div className="text-red-600">{error}</div>}
        {actionError && <div className="text-red-600">{actionError}</div>}

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 text-center italic">No appointments found.</p>
        ) : (
          appointments.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              userRole={userRole}
              onApprove={(id) => handleAction(id, appointmentService.approveAppointment)}
              onReject={(id) => handleAction(id, appointmentService.rejectAppointment)}
              onCancel={(id) => handleAction(id, appointmentService.cancelAppointment)}
              onComplete={(id) => handleAction(id, appointmentService.completeAppointment)}
              onRate={(id) => handleAction(id, appointmentService.rateAppointment)}
            />
          ))
        )}

        <Pagination pagination={pagination} onChange={(page) => refresh({ ...pagination, page })} />

        {/* Create/Edit Appointment Modal */}
        <Modal
          isOpen={createModalOpen || editModalOpen}
          onClose={closeModals}
          title={selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
          size="medium"
          showCloseButton
        >
          <AppointmentForm
            initialData={selectedAppointment}
            onSubmit={handleSubmit}
            loading={actionLoading}
            onCancel={closeModals}
            // You might want to pass a list of teachers fetched elsewhere or from context
            teachers={[]} 
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
