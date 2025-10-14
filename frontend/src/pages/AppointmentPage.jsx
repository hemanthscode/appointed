// pages/AppointmentPage.jsx
import React, { useState } from 'react';
import { Layout } from '../components/common';
import { Card, Modal, Button } from '../components/ui';
import AppointmentForm from '../components/forms/AppointmentForm';
import { useAuth, useAppointments } from '../hooks';
import appointmentService from '../services/appointmentService';
import AppointmentCard from '../components/cards/AppointmentCard';

const AppointmentPage = () => {
  const { appointments, pagination, loading, error, refresh } = useAppointments();
  const { user } = useAuth();
  const userRole = user?.role || null;

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const openCreateModal = () => {
    setSelectedAppointment(null);
    setModalOpen(true);
  };

  const openEditModal = appointment => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setModalOpen(false);
  };

  const handleSubmit = async data => {
    setActionError(null);
    setActionLoading(true);
    try {
      if (selectedAppointment) {
        await appointmentService.updateAppointment(selectedAppointment._id, data);
      } else {
        await appointmentService.createAppointment(data);
      }
      await refresh();
      closeModal();
    } catch (err) {
      setActionError(err.message);
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
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <Button onClick={openCreateModal} variant="primary">New Appointment</Button>
        </div>

        {error && <div className="text-red-600">{error}</div>}
        {actionError && <div className="text-red-600">{actionError}</div>}

        {loading ? (
  <div className="text-center text-gray-500 my-12">Loading appointments...</div>
) : appointments?.length === 0 ? (
  <p className="text-center text-gray-500 italic">No appointments found.</p>
) : (
  appointments?.map(appt => (
    <AppointmentCard
      key={appt._id}
      appointment={appt}
      userRole={userRole}
      onApprove={id => handleAction(id, appointmentService.approveAppointment)}
      onReject={id => handleAction(id, appointmentService.rejectAppointment)}
      onCancel={id => handleAction(id, appointmentService.cancelAppointment)}
      onComplete={id => handleAction(id, appointmentService.completeAppointment)}
      onRate={id => handleAction(id, appointmentService.rateAppointment)}
    />
  ))
)}


        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
          size="medium"
          showCloseButton
        >
          <AppointmentForm
            initialData={selectedAppointment}
            onSubmit={handleSubmit}
            loading={actionLoading}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default AppointmentPage;
