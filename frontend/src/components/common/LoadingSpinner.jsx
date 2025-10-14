import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../utils/animations';

const LoadingSpinner = ({ size = 'medium', color = 'white', text = null, className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16',
  };

  const colorClasses = {
    white: 'border-white',
    black: 'border-black',
    gray: 'border-gray-500',
    primary: 'border-blue-500',
    success: 'border-green-500',
    danger: 'border-red-500',
    warning: 'border-yellow-500',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
        animate={ANIMATIONS.pulse.animate}
        transition={ANIMATIONS.pulse.transition}
      />
      {text && <p className="mt-3 text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
