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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">Decline Booking Request?</h3>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            Are you sure you want to decline booking{' '}
            <strong className="text-gray-900 font-mono">#{booking.id}</strong> for{' '}
            <strong className="text-gray-900">{booking.service?.title}</strong> on{' '}
            {booking.bookingDate}? This will update the status to <span className="font-semibold text-rose-600">REJECTED</span> and release the time slot.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            disabled={isRejecting}
            onClick={onClose}
            className="flex-1"
          >
            Keep Pending
          </Button>
          <Button
            variant="danger"
            size="md"
            isLoading={isRejecting}
            disabled={isRejecting}
            onClick={onConfirm}
            className="flex-1"
          >
            Decline Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
