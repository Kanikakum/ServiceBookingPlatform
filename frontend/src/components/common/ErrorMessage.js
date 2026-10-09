import React from 'react';

/**
 * Accessible error alert box for forms and page notices.
 * Black & white design system — uses dark border and dark text, no red colors.
 */
export default function ErrorMessage({
  message,
  errors = null,
  title = null,
  onDismiss = null,
  className = '',
}) {
  if (!message && (!errors || errors.length === 0)) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`rounded-sm bg-[#F7F7F7] border border-[#111111] p-4 text-[#111111] ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-[#111111] mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-semibold text-[#111111]">{title}</h3>}
          {message && <div className="text-sm text-[#111111]">{message}</div>}
          {Array.isArray(errors) && errors.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-[#666666] space-y-1">
              {errors.map((err, idx) => (
                <li key={idx}>
                  {typeof err === 'string'
                    ? err
                    : err.message || `${err.field ? `${err.field}: ` : ''}${JSON.stringify(err)}`}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-auto -mx-1.5 -my-1.5 bg-[#F7F7F7] text-[#666666] rounded-sm p-1.5 hover:bg-[#E5E5E5] focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
            aria-label="Dismiss error"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
