import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../utils/animations';

const variantClasses = {
  primary: 'bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300',
  secondary: 'border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-black transition-all duration-300',
  danger: 'bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all duration-300',
  success: 'bg-green-600 text-white hover:bg-green-700 transition-all duration-300',
  info: 'bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 transition-all duration-300',
  ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white transition-all duration-300',
  link: 'bg-transparent border-none p-0 hover:underline text-white transition-all duration-300',
};

const sizeClasses = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-3',
  large: 'px-8 py-4 text-lg',
};

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
  const baseClass = variantClasses[variant] || variantClasses.primary;
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClasses[size]} ${widthClass} ${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center space-x-2`}
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
