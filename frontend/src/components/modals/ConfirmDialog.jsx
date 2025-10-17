import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, loading }) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title || 'Confirm Action'} ariaLabel="Confirmation dialog">
    <p className="mb-4 text-black">{message}</p>
    <div className="flex justify-end space-x-4">
      <Button
        onClick={onCancel}
        ariaLabel="Cancel"
        className="bg-white text-black border border-black hover:bg-gray-200 focus:ring-2 focus:ring-black"
      >
        Cancel
      </Button>
      <Button onClick={onConfirm} ariaLabel="Confirm" disabled={loading}>
        {loading ? 'Processing...' : 'Confirm'}
      </Button>
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
};

ConfirmDialog.defaultProps = {
  title: 'Confirm Action',
  loading: false,
};

export default React.memo(ConfirmDialog);
