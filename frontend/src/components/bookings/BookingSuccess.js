import React from 'react';
import Link from 'next/link';
import Button from '../common/Button';
import BookingStatusBadge from './BookingStatusBadge';

export default function BookingSuccess({ booking, onBookAnother }) {
  if (!booking) return null;

  return (
    <div className="rounded-sm border border-[#E5E5E5] bg-white p-6 sm:p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center mx-auto">
        <svg
          className="w-9 h-9"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
          Booking Placed Successfully
        </span>
        <h2 className="text-2xl font-extrabold text-[#111111] mt-1">
          Appointment Scheduled!
        </h2>
        <p className="text-xs text-[#666666] mt-1">
          Booking Reference <strong className="text-[#111111] font-mono">#{booking.id}</strong>
        </p>
      </div>

      {/* Details Box */}
      <div className="bg-[#F7F7F7] rounded-sm border border-[#E5E5E5] p-5 text-left max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
          <span className="text-xs text-[#666666]">Status</span>
          <BookingStatusBadge status={booking.status || 'PENDING'} />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#666666]">Service</span>
          <span className="font-semibold text-[#111111]">{booking.service?.title}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#666666]">Provider</span>
          <span className="font-semibold text-[#111111]">{booking.provider?.name || 'Assigned Provider'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#666666]">Date</span>
          <span className="font-semibold text-[#111111]">{booking.bookingDate}</span>
        </div>

        <div className="flex items-center justify-between text-xs border-t border-[#E5E5E5] pt-2.5">
          <span className="text-xs font-semibold text-[#666666]">Locked Price</span>
          <span className="text-base font-bold text-[#111111]">
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
