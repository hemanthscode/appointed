// Export all utilities
export * from './helpers';
export * from './validators';
export * from './animations';

// Re-export commonly used functions from helpers.js
export {
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  truncateText,
  getInitials,
  filterBySearch,
  debounce,
  getStatusColor,
  getStatusVariant,
  getErrorMessage
} from './helpers';

// Re-export commonly used functions from validators.js  
export {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateRequired,
  validateForm,           // ✅ This should come from validators.js
  validateLoginForm,      // ✅ This should come from validators.js
  validateRegisterForm,   // ✅ This should come from validators.js
  validateAppointmentForm,// ✅ This should come from validators.js
  validateProfileForm     // ✅ This should come from validators.js
} from './validators';

// Re-export commonly used functions from animations.js
export {
  fadeIn,
  fadeInUp,
  hoverScale,
  buttonPress,
  staggerContainer,
  staggerItem,
  pageTransition,
  modalTransition
} from './animations';
