import React from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  primary: 'bg-black text-white hover:bg-black-800',
  secondary: 'bg-white text-black border-2 border-black hover:bg-gray-50',
  outline: 'bg-transparent text-black border-2 border-black hover:bg-black-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-2 border-red-600',
  ghost: 'bg-transparent text-black hover:bg-gray-100',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = React.forwardRef(({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '', 
  ariaLabel 
}, ref) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Button;