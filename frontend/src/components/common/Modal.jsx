import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  ariaLabel,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
      
      const onKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = SIZES[size] || SIZES.md;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      tabIndex="-1"
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
      onClick={(e) => closeOnOverlayClick && e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-xl ${sizeStyles} w-full shadow-2xl border-2 border-black transform transition-all`}>
        {(title || showCloseButton) && (
          <header className="flex justify-between items-center px-6 py-4 border-b-2 border-black">
            <h2 className="text-xl font-bold text-black">{title}</h2>
            {showCloseButton && (
              <button
                aria-label="Close modal"
                className="text-black hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200 font-bold text-2xl leading-none"
                onClick={onClose}
                type="button"
              >
                &times;
              </button>
            )}
          </header>
        )}
        <div className="px-6 py-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {children}
        </div>
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
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
};

export default Modal;