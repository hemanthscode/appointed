import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import AppointmentForm from '../forms/AppointmentForm';

const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  loading, 
  initialData,
  metadata,
  serverError 
}) => {
  const isEditing = !!initialData?.id;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? 'Edit Appointment' : 'Schedule New Appointment'} 
      ariaLabel={isEditing ? 'Edit appointment modal' : 'Create appointment modal'}
      size="lg"
    >
      <AppointmentForm 
        onSubmit={onSave} 
        loading={loading} 
        initialData={initialData}
        metadata={metadata}
        serverError={serverError}
      />
    </Modal>
  );
};

AppointmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  initialData: PropTypes.object,
  metadata: PropTypes.object,
  serverError: PropTypes.string,
};

export default React.memo(AppointmentModal);