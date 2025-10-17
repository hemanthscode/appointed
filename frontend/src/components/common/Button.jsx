import React from 'react';
import PropTypes from 'prop-types';

const Button = React.forwardRef(({ children, onClick, type = 'button', disabled = false, className = '', ariaLabel }, ref) => {
  return (
    <button
      type={type}
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        bg-black text-white font-semibold py-2 px-4 rounded 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black 
        disabled:opacity-50 disabled:cursor-not-allowed 
        transition duration-150 ease-in-out 
        ${className}
      `}
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
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Button;
