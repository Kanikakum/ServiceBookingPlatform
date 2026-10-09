import React from 'react';
import Button from '../common/Button';

export default function RejectBookingModal({
  booking,
  onClose,
  onConfirm,
  isRejecting = false,
  error = null,
}) {
  if (!booking) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div className="bg-white rounded-sm max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E5E5E5] space-y-5">
        <div className="w-12 h-12 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="text-center">
          <h3 id="reject-modal-title" className="text-lg font-bold text-[#111111]">
            Decline Booking Request?
          </h3>
          <p className="mt-2 text-sm text-[#666666] leading-relaxed">
            Are you sure you want to decline booking{' '}
            <strong className="text-[#111111] font-mono">#{booking.id}</strong> for{' '}
            <strong className="text-[#111111]">{booking.service?.title}</strong> on{' '}
            {booking.bookingDate}? This will update the status to{' '}
            <span className="font-semibold text-[#111111]">DECLINED</span> and release the time slot.
          </p>
        </div>

        {error && (
          <div className="rounded-sm bg-[#F7F7F7] border border-[#111111] p-3 text-sm text-[#111111]">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            size="md"
            disabled={isRejecting}
            onClick={onClose}
            className="flex-1 rounded-sm border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F7]"
          >
            Keep Pending
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isRejecting}
            disabled={isRejecting}
            onClick={onConfirm}
            className="flex-1 rounded-sm bg-[#111111] text-white hover:bg-black"
          >
            Decline Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
