import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { X } from 'lucide-react';

const sizeClasses = {
  small: 'max-w-md',
  medium: 'max-w-lg',
  large: 'max-w-2xl',
  xlarge: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal = ({ isOpen, onClose, title, children, footer, size = 'medium', closeOnBackdrop = true, showCloseButton = true }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`relative bg-gray-900 rounded-xl border border-gray-800 shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
                {showCloseButton && <Button variant="ghost" size="small" onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg ml-auto" icon={<X className="h-4 w-4" />} />}
              </div>
            )}
            <div className="p-6 text-white">{children}</div>
            {footer && <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-800">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
