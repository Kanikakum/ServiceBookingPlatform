import React from 'react';

/**
 * Reusable badge displaying booking status with accessible semantic colors and labels.
 */
export default function BookingStatusBadge({ status, className = '' }) {
  const config = {
    PENDING: {
      label: 'Awaiting Provider',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    CONFIRMED: {
      label: 'Confirmed',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    REJECTED: {
      label: 'Declined',
      classes: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
    },
    CANCELLED: {
      label: 'Cancelled',
      classes: 'bg-gray-100 text-gray-700 border-gray-200',
      dot: 'bg-gray-400',
    },
    COMPLETED: {
      label: 'Completed',
      classes: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      dot: 'bg-indigo-500',
    },
  };

  const statusConfig = config[status] || {
    label: status || 'Unknown',
    classes: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.classes} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`} />
      {statusConfig.label}
    </span>
  );
}
