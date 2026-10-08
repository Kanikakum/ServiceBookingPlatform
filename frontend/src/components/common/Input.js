import React, { forwardRef } from 'react';

/**
 * Reusable accessible input component with label, error display, and focus styling.
 */
const Input = forwardRef(function Input(
  {
    label,
    id,
    name,
    type = 'text',
    error,
    helperText,
    required = false,
    disabled = false,
    placeholder,
    className = '',
    autoComplete,
    ...props
  },
  ref
) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900 placeholder-red-300'
              : 'border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-indigo-100 placeholder-gray-400'
          }`}
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600 flex items-center">
          <svg
            className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
