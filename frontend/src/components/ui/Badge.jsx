import React from 'react';

const variantClasses = {
  success: 'bg-green-900/50 text-green-300',
  warning: 'bg-yellow-900/50 text-yellow-300',
  danger: 'bg-red-900/50 text-red-300',
  info: 'bg-blue-900/50 text-blue-300',
  primary: 'bg-white text-black',
  secondary: 'bg-gray-700 text-gray-300',
};

const sizeClasses = {
  small: 'px-2 py-1 text-xs',
  medium: 'px-3 py-1 text-sm',
  large: 'px-4 py-2',
};

const Badge = ({ children, variant = 'info', size = 'medium', className = '', icon = null }) => {
  const baseClass = variantClasses[variant] || variantClasses.info;

  return (
    <span
      className={`${baseClass} ${sizeClasses[size]} ${className} rounded-full font-medium flex items-center space-x-1 w-fit`}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
