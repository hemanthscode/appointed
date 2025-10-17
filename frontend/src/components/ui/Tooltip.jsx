import React from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({ children, text }) => (
  <div className="relative group inline-block">
    {children}
    <span
      role="tooltip"
      className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg z-50 pointer-events-none select-none"
    >
      {text}
    </span>
  </div>
);

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

export default React.memo(Tooltip);
