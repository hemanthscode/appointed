import React from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const Input = React.forwardRef(({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error, 
  size = 'md',
  disabled = false,
  required = false,
  helperText,
  className = '', 
  wrapperClassName = '', 
  ...rest 
}, ref) => {
  const sizeStyles = SIZES[size] || SIZES.md;
  const inputStyles = `
    w-full border-2 rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-black focus:border-black
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
    ${error ? 'border-red-600 focus:ring-red-600 focus:border-red-600' : 'border-black'}
    ${sizeStyles}
    ${className}
  `;

  return (
    <div className={`flex flex-col ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="mb-1.5 font-semibold text-black text-sm">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={inputStyles}
          {...rest}
        />
      ) : (
        <input
          id={id}
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={inputStyles}
          {...rest}
        />
      )}

      {helperText && !error && (
        <span id={`${id}-helper`} className="mt-1 text-xs text-gray-600">
          {helperText}
        </span>
      )}
      
      {error && (
        <span id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  helperText: PropTypes.string,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
};

export default Input;