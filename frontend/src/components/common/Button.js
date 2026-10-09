import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Reusable, accessible button supporting multiple variants, sizes, and loading states.
 * Minimalist Black & White design system with 1px border-radius.
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
    'inline-flex items-center justify-center font-medium rounded-[2px] transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantClasses = {
    primary:
      'bg-[#111111] hover:bg-black text-white active:bg-black border border-[#111111]',
    secondary:
      'bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#111111] active:bg-[#E5E5E5] border border-[#E5E5E5]',
    outline:
      'border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] text-[#111111] hover:border-[#1F1F1F]',
    danger:
      'border border-[#1F1F1F] bg-[#1F1F1F] hover:bg-black text-white active:bg-black',
    ghost:
      'bg-transparent hover:bg-[#F7F7F7] text-[#666666] hover:text-[#111111] border border-transparent',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
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
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'dark'}
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
