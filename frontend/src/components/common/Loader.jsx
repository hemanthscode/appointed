import React from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const Loader = ({ 
  size = 'md', 
  variant = 'spinner',
  className = '' 
}) => {
  const sizeValue = typeof size === 'number' ? size : SIZES[size] || SIZES.md;

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-2 ${className}`} aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-black rounded-full animate-pulse"
            style={{
              width: sizeValue / 3,
              height: sizeValue / 3,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <svg
      className={`animate-spin text-black ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={sizeValue}
      height={sizeValue}
      aria-label="Loading"
      role="img"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['sm', 'md', 'lg', 'xl'])]),
  variant: PropTypes.oneOf(['spinner', 'dots']),
  className: PropTypes.string,
};

export default Loader;