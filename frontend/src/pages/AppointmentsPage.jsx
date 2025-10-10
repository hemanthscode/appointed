import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { Layout } from '../components/common';
import { AppointmentCard } from '../components/cards';
import { Button } from '../components/ui';
import { useApi } from '../hooks';
import { appointmentService } from '../services';
import { ROUTES, ANIMATIONS } from '../utils';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch appointments and pagination from API response data object
  const { data, reload } = useApi(() => appointmentService.getAppointments(), []);

  // Defensive extract
  const appointments = (data && Array.isArray(data.appointments)) ? data.appointments : [];
  const pagination = (data && data.pagination) ? data.pagination : {};

  const handleAppointmentAction = async (action, appointmentId) => {
    try {
      switch (action) {
        case 'cancel':
          await appointmentService.cancelAppointment(appointmentId);
          break;
        case 'reschedule':
          // Implement reschedule logic
          break;
        case 'join':
          // Implement join logic
          break;
        default:
          break;
      }
      await reload(); // Reload appointments after action
    } catch (error) {
      console.error(`${action} appointment error:`, error);
    }
  };

  const filteredAppointments = appointments.filter(
    (apt) => filterStatus === 'all' || apt.status === filterStatus
  );

  const headerActions = (
    <Button onClick={() => navigate(ROUTES.TEACHERS)} icon={<Plus className="h-4 w-4" />}>
      Book New
    </Button>
  );

  return (
    <Layout headerTitle="My Appointments" headerBackTo={ROUTES.DASHBOARD} headerActions={headerActions}>
      <div className="p-6">
        <motion.div className="mb-6" {...ANIMATIONS.fadeInUp}>
          <div className="flex space-x-2 bg-gray-900/50 p-1 rounded-lg inline-flex">
            {['all', 'pending', 'confirmed', 'completed', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filterStatus === status ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          initial="initial"
          animate="animate"
          variants={ANIMATIONS.staggerChildren}
        >
          {filteredAppointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id || appointment._id}
              appointment={appointment}
              onAction={handleAppointmentAction}
              userRole="student"
              index={index}
            />
          ))}
        </motion.div>

        {filteredAppointments.length === 0 && (
          <motion.div className="text-center py-16" {...ANIMATIONS.fadeInUp}>
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No appointments found</h3>
            <p className="text-gray-400 mb-6">
              {filterStatus === 'all'
                ? "You haven't booked any appointments yet."
                : `No ${filterStatus} appointments found.`}
            </p>
            <Button onClick={() => navigate(ROUTES.TEACHERS)}>Book Your First Appointment</Button>
          </motion.div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => setFilterStatus((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <span className="self-center">
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilterStatus((prev) => Math.min(prev + 1, pagination.totalPages))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
