import React from 'react';

const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  rows = 4,
  ...props
}) => {
  const textareaId = id || name;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-300">
          {icon && <span className="inline-block mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          id={textareaId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={rows}
          className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          required={required}
          {...props}
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};

export default Textarea;
