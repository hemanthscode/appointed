import React from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const Dropdown = ({
  label,
  options,
  value,
  onChange,
  id,
  name,
  error,
  disabled,
  required = false,
  size = 'md',
  helperText,
  placeholder = 'Select an option',
}) => {
  const sizeStyles = SIZES[size] || SIZES.md;
  const selectStyles = `
    w-full border-2 rounded-lg transition-all duration-200 bg-white
    focus:outline-none focus:ring-2 focus:ring-black focus:border-black
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
    ${error ? 'border-red-600 focus:ring-red-600 focus:border-red-600' : 'border-black'}
    ${sizeStyles}
  `;

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="mb-1.5 font-semibold text-black text-sm">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <select
        id={id}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={selectStyles}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {(Array.isArray(options) ? options : []).map(({ value: optValue, label: optLabel }, index) => (
          <option key={optValue ?? index} value={optValue}>
            {optLabel}
          </option>
        ))}
      </select>

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
};

Dropdown.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  helperText: PropTypes.string,
  placeholder: PropTypes.string,
};

export default Dropdown;
