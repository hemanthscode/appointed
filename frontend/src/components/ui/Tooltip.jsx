import React from 'react';
import PropTypes from 'prop-types';

const POSITIONS = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
};

const Tooltip = ({ 
  children, 
  text, 
  position = 'top',
  variant = 'dark' 
}) => {
  const positionStyles = POSITIONS[position] || POSITIONS.top;
  const variantStyles = variant === 'dark' 
    ? 'bg-black text-white' 
    : 'bg-white text-black border-2 border-black';

  return (
    <div className="relative group inline-block">
      {children}
      <span
        role="tooltip"
        className={`
          absolute ${positionStyles} hidden group-hover:block
          ${variantStyles} text-xs rounded-lg px-3 py-2
          whitespace-nowrap shadow-lg z-50 pointer-events-none
          transition-opacity duration-200
        `}
      >
        {text}
      </span>
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  variant: PropTypes.oneOf(['dark', 'light']),
};

export default React.memo(Tooltip);