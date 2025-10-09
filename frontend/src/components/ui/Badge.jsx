import React from 'react';

const Badge = ({
  children,
  variant = 'info',
  size = 'medium',
  className = '',
  icon = null
}) => {
  const getVariantClass = (variant) => {
    switch (variant) {
      case 'success':
        return 'bg-green-900/50 text-green-300';
      case 'warning':
        return 'bg-yellow-900/50 text-yellow-300';
      case 'danger':
        return 'bg-red-900/50 text-red-300';
      case 'info':
        return 'bg-blue-900/50 text-blue-300';
      case 'primary':
        return 'bg-white text-black';
      case 'secondary':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-blue-900/50 text-blue-300';
    }
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2'
  };

  const baseClass = getVariantClass(variant);

  return (
    <span className={`${baseClass} ${sizeClasses[size]} ${className} rounded-full font-medium flex items-center space-x-1 w-fit`}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
