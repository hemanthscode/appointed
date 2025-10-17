import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import AppointmentForm from '../forms/AppointmentForm';

const AppointmentModal = ({ isOpen, onClose, onSave, loading, initialData }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details" ariaLabel="Appointment details modal">
    <AppointmentForm onSubmit={onSave} loading={loading} initialData={initialData} />
  </Modal>
);

AppointmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  initialData: PropTypes.object,
};

AppointmentModal.defaultProps = {
  loading: false,
  initialData: {},
};

export default React.memo(AppointmentModal);
