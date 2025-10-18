import React from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  variant = 'circular',
  showBorder = true,
  className = '' 
}) => {
  const sizeValue = typeof size === 'number' ? size : SIZES[size] || SIZES.md;
  const shapeStyles = variant === 'circular' ? 'rounded-full' : 'rounded-lg';
  const borderStyles = showBorder ? 'border-2 border-black shadow-sm' : '';

  return (
    <img
      src={src || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=000&color=fff&size=${sizeValue}`}
      alt={alt}
      width={sizeValue}
      height={sizeValue}
      loading="lazy"
      decoding="async"
      className={`object-cover ${shapeStyles} ${borderStyles} ${className}`}
      style={{ minWidth: sizeValue, minHeight: sizeValue }}
    />
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl'])]),
  variant: PropTypes.oneOf(['circular', 'square']),
  showBorder: PropTypes.bool,
  className: PropTypes.string,
};

export default React.memo(Avatar);