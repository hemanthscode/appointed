import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ src, alt, size = 40, className = '' }) => (
  <img
    src={src || '/default-avatar.png'}
    alt={alt}
    width={size}
    height={size}
    loading="lazy"
    decoding="async"
    className={`rounded-full object-cover select-none shadow-sm border border-gray-300 ${className}`}
    style={{ minWidth: size, minHeight: size }}
  />
);

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
};

export default React.memo(Avatar);
