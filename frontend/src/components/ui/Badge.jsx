import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({ children, color = 'black', className = '' }) => {
  const bgColor = color === 'black' ? 'bg-black text-white' : 'bg-white text-black border border-black';
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full select-none ${bgColor} ${className}`}
      aria-label="badge"
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['black', 'white']),
  className: PropTypes.string,
};

export default React.memo(Badge);
