import React from 'react';

/**
 * Reusable badge displaying booking status with monochrome black/white/gray visual states.
 * Status values are not changed — only presentation.
 */
export default function BookingStatusBadge({ status, className = '' }) {
  const config = {
    PENDING: {
      label: 'Awaiting Provider',
      classes: 'bg-[#F7F7F7] text-[#666666] border-[#E5E5E5]',
      dot: 'bg-[#666666]',
    },
    CONFIRMED: {
      label: 'Confirmed',
      classes: 'bg-[#111111] text-white border-[#111111]',
      dot: 'bg-white',
    },
    REJECTED: {
      label: 'Declined',
      classes: 'bg-[#1F1F1F] text-[#E5E5E5] border-[#1F1F1F]',
      dot: 'bg-[#E5E5E5]',
    },
    CANCELLED: {
      label: 'Cancelled',
      classes: 'bg-[#F7F7F7] text-[#666666] border-[#E5E5E5]',
      dot: 'bg-[#666666]',
    },
    COMPLETED: {
      label: 'Completed',
      classes: 'bg-[#111111] text-white border-[#111111]',
      dot: 'bg-[#E5E5E5]',
    },
  };

  const statusConfig = config[status] || {
    label: status || 'Unknown',
    classes: 'bg-[#F7F7F7] text-[#666666] border-[#E5E5E5]',
    dot: 'bg-[#666666]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold border ${statusConfig.classes} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-[1px] mr-1.5 ${statusConfig.dot}`} aria-hidden="true" />
      {statusConfig.label}
    </span>
  );
}
