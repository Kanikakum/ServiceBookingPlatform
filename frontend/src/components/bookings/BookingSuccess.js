import React from 'react';
import Link from 'next/link';
import Button from '../common/Button';
import BookingStatusBadge from './BookingStatusBadge';

export default function BookingSuccess({ booking, onBookAnother }) {
  if (!booking) return null;

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
        <svg
          className="w-9 h-9"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Booking Placed Successfully
        </span>
        <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
          Appointment Scheduled!
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Booking Reference <strong className="text-gray-900 font-mono">#{booking.id}</strong>
        </p>
      </div>

      {/* Details Box */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-5 text-left max-w-md mx-auto space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <span className="text-xs text-gray-500">Status</span>
          <BookingStatusBadge status={booking.status || 'PENDING'} />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Service</span>
          <span className="font-semibold text-gray-900">{booking.service?.title}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Provider</span>
          <span className="font-semibold text-gray-900">{booking.provider?.name || 'Assigned Provider'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Date</span>
          <span className="font-semibold text-gray-900">{booking.bookingDate}</span>
        </div>

        <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
          <span className="text-xs font-semibold text-gray-700">Locked Price</span>
          <span className="text-base font-bold text-gray-900">
            ₹{Number(booking.totalPrice).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/customer/bookings" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full sm:w-auto">
            View My Bookings →
          </Button>
        </Link>
        {onBookAnother && (
          <Button variant="outline" size="md" onClick={onBookAnother} className="w-full sm:w-auto">
            Book Another Time
          </Button>
        )}
      </div>
    </div>
  );
}
