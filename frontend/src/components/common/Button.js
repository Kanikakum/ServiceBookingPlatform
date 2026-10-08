import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Reusable, accessible button supporting multiple variants, sizes, and loading states.
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow focus:ring-indigo-500 active:bg-indigo-800',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400 active:bg-gray-300',
    outline:
      'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-indigo-500 shadow-sm',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow focus:ring-red-500 active:bg-red-800',
    ghost:
      'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 focus:ring-gray-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner
            size="sm"
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'}
            className="mr-2"
          />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
