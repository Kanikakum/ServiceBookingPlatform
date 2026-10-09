import React, { forwardRef } from 'react';

/**
 * Reusable accessible input component with label, error display, and focus styling.
 * Black & white design system.
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
          className="block text-sm font-medium text-[#111111] mb-1.5"
        >
          {label}
          {required && <span className="text-[#666666] ml-1" aria-hidden="true">*</span>}
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
          className={`block w-full rounded-sm border px-3.5 py-2.5 text-sm text-[#111111] bg-white transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:bg-[#F7F7F7] disabled:text-[#666666] disabled:cursor-not-allowed placeholder-[#666666] ${
            error
              ? 'border-[#1F1F1F] focus-visible:border-black focus-visible:ring-black'
              : 'border-[#E5E5E5] hover:border-[#666666] focus-visible:border-black'
          }`}
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-[#1F1F1F] flex items-center" role="alert">
          <svg
            className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-[#1F1F1F]"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
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
        <p id={helperId} className="mt-1.5 text-xs text-[#666666]">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
