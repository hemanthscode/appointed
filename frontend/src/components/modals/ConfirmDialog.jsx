import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  loading,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onCancel} 
    title={title || 'Confirm Action'} 
    ariaLabel="Confirmation dialog"
    size="sm"
  >
    <div className="py-2">
      <p className="mb-6 text-black text-base">{message}</p>
      <div className="flex justify-end gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          ariaLabel={cancelText}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant={variant}
          ariaLabel={confirmText}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </div>
    </div>
  </Modal>
);

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'danger', 'secondary']),
};

export default React.memo(ConfirmDialog);