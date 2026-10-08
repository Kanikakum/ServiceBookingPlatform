import React from 'react';

/**
 * Accessible, customizable loading spinner.
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    primary: 'border-indigo-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex flex-col items-center justify-center ${className}`}
    >
      <div
        className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${
          colorClasses[color] || colorClasses.primary
        }`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
