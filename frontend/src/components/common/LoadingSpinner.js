import React from 'react';

/**
 * Accessible, customizable loading spinner.
 * Uses black & white color scheme.
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'dark',
  label = 'Loading...',
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    dark: 'border-[#111111] border-t-transparent',
    primary: 'border-[#111111] border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-[#666666] border-t-transparent',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex flex-col items-center justify-center ${className}`}
    >
      <div
        className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${
          colorClasses[color] || colorClasses.dark
        }`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
