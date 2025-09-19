import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../data/constants';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  icon = null,
  loading = false,
  fullWidth = false,
  ...props 
}) => {
  const getVariantClass = (variant) => {
    switch (variant) {
      case 'primary':
        return 'bg-white text-black hover:bg-gray-100';
      case 'secondary':
        return 'border-2 border-white text-white hover:bg-white hover:text-black';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'info':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white';
      case 'link':
        return 'bg-transparent border-none p-0 hover:bg-transparent text-white hover:underline';
      default:
        return 'bg-white text-black hover:bg-gray-100';
    }
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3',
    large: 'px-8 py-4 text-lg'
  };

  const baseClass = `font-bold rounded-lg transition-all duration-300 ${getVariantClass(variant)}`;
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClasses[size]} ${widthClass} ${className} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } flex items-center justify-center space-x-2`}
      {...ANIMATIONS.scaleOnHover}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
};

export default Button;
