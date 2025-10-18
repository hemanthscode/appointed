import React from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  primary: 'bg-black text-white',
  secondary: 'bg-white text-black border-2 border-black',
  outline: 'bg-transparent text-black border-2 border-black',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-500 text-black',
  danger: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${variantStyles} ${sizeStyles} ${className}`}
      aria-label="badge"
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default React.memo(Badge);