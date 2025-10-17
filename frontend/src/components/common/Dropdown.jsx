import React from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({ label, options, value, onChange, id, name, error, disabled, placeholder = 'Select' }) => (
  <div className="flex flex-col">
    {label && (
      <label htmlFor={id} className="mb-1 font-medium text-black select-none">
        {label}
      </label>
    )}
    <select
      id={id}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(e)}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`border border-black rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black transition duration-150 ease-in-out ${
        error ? 'border-red-600' : ''
      } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    >
      <option value="">{placeholder}</option>
      {options.map(({ value: optValue, label: optLabel }) => (
        <option key={optValue} value={optValue}>
          {optLabel}
        </option>
      ))}
    </select>
    {error && (
      <span id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600 font-normal">
        {error}
      </span>
    )}
  </div>
);

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
  placeholder: PropTypes.string,
};

export default Dropdown;
