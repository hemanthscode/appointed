import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hoverable = false, clickable = false, onClick, padding = 'p-6', ...props }) => {
  const cardProps = {
    className: `bg-gray-900/50 backdrop-blur-sm ${padding} rounded-xl border border-gray-800 ${clickable ? 'cursor-pointer' : ''} ${className}`,
    onClick: clickable ? onClick : undefined,
    ...props,
  };

  if (hoverable || clickable) {
    cardProps.whileHover = { scale: 1.02 };
    cardProps.whileTap = clickable ? { scale: 0.98 } : undefined;
  }

  return <motion.div {...cardProps}>{children}</motion.div>;
};

export default Card;
