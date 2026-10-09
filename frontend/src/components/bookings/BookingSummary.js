import React from 'react';

/**
 * Format numeric price.
 */
const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

export default function BookingSummary({ service, selectedDate, selectedSlot }) {
  if (!service || !selectedDate || !selectedSlot) {
    return null;
  }

  return (
    <div className="rounded-sm border border-[#E5E5E5] bg-[#F7F7F7] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
        <h3 className="text-sm font-bold text-[#111111]">3. Booking Summary</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-[#111111] text-white">
          Price Locked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[#666666] block">Service</span>
          <span className="font-semibold text-[#111111] text-sm mt-0.5 block">{service.title}</span>
        </div>

        <div>
          <span className="text-[#666666] block">Service Provider</span>
          <span className="font-semibold text-[#111111] text-sm mt-0.5 block">
            {service.provider?.name || 'Verified Provider'}
          </span>
        </div>

        <div>
          <span className="text-[#666666] block">Date &amp; Time</span>
          <span className="font-semibold text-[#111111] text-sm mt-0.5 block">
            {selectedDate} ({selectedSlot.startTime} – {selectedSlot.endTime})
          </span>
        </div>

        <div>
          <span className="text-[#666666] block">Duration</span>
          <span className="font-semibold text-[#111111] text-sm mt-0.5 block">
            {service.durationMinutes} minutes
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
        <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
          Total Amount
        </span>
        <span className="text-xl font-extrabold text-[#111111]">
          {formatPrice(service.price)}
        </span>
      </div>

      <div className="flex items-center text-[11px] text-[#666666] bg-white p-2.5 rounded-sm border border-[#E5E5E5]">
        <svg
          className="w-4 h-4 mr-1.5 text-[#666666] flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Availability is finalized upon confirmation through our concurrency-safe booking engine.</span>
      </div>
    </div>
  );
}
