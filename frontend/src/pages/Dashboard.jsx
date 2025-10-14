import React, { useEffect, useState } from 'react';
import { Layout } from '../components/common';
import AppointmentCard from '../components/cards/AppointmentCard';
import AppointmentForm from '../components/forms/AppointmentForm';
import Modal from '../components/ui/Modal';
import { Button } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';
import appointmentService from '../services/appointmentService';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSystemStats = async () => {
    setLoadingStats(true);
    try {
      const data = await adminService.getSystemStats();
      setStats(data);
    } catch {
      toast.addToast('Failed to load system statistics.', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const roleFilter = user.role === 'student' ? { student: user._id, status: 'confirmed' } : {};
      const data = await appointmentService.getAppointments(roleFilter);
      setAppointments(data);
    } catch {
      toast.addToast('Failed to load appointments.', 'error');
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSystemStats();
      fetchAppointments();
    }
  }, [user]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleAppointmentSubmit = async (formData) => {
    setActionLoading(true);
    try {
      await appointmentService.createAppointment(formData);
      toast.addToast('Appointment booked successfully.', 'success');
      closeModal();
      fetchAppointments();
    } catch (err) {
      toast.addToast(err.message || 'Booking failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout headerTitle={`Welcome, ${user?.name || 'User'}`}>
      <div className="max-w-5xl mx-auto p-6 space-y-10 text-white">
        <section>
          <h2 className="text-3xl font-semibold mb-6">Your Upcoming Appointments</h2>
          {loadingAppointments ? (
            <p>Loading your appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="italic text-gray-400">No upcoming appointments.</p>
          ) : (
            appointments.map(appt => <AppointmentCard key={appt._id} appointment={appt} userRole={user.role} />)
          )}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Button variant="primary" size="large" onClick={openModal}>Book New Appointment</Button>
          <Button variant="secondary" size="large" onClick={() => (window.location.href = '/appointments')}>View All Appointments</Button>
          <Button variant="secondary" size="large" onClick={() => (window.location.href = '/messages')}>Messages</Button>
          <Button variant="secondary" size="large" onClick={() => (window.location.href = '/profile')}>My Profile</Button>
          <Button variant="secondary" size="large" onClick={() => (window.location.href = '/change-password')}>Change Password</Button>
        </section>

        <Modal isOpen={modalOpen} onClose={closeModal} title="Book New Appointment" size="medium" showCloseButton>
          <AppointmentForm onSubmit={handleAppointmentSubmit} loading={actionLoading} onCancel={closeModal} />
        </Modal>
      </div>
    </Layout>
  );
};

export default Dashboard;
