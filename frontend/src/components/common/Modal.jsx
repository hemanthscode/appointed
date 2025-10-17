import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, title, children, ariaLabel }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      const onKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      tabIndex="-1"
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-lg">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          <button
            aria-label="Close modal"
            className="text-black font-bold text-xl focus:outline-none"
            onClick={onClose}
            type="button"
          >
            &times;
          </button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  ariaLabel: PropTypes.string,
};

export default Modal;
