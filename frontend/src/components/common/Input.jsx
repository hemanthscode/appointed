import React from 'react';
import PropTypes from 'prop-types';

const Input = React.forwardRef(
  ({ label, id, type = 'text', value, onChange, placeholder, error, className = '', wrapperClassName = '', ...rest }, ref) => (
    <div className={`flex flex-col relative ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="mb-1 font-medium text-black select-none">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out ${
          error ? 'border-red-600' : ''
        } ${type === 'password' ? 'pr-10' : ''} ${className}`}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600 font-normal">
          {error}
        </span>
      )}
    </div>
  )
);

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
};

export default Input;
