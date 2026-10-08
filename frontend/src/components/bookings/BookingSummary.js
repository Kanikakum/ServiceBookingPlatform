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
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-100/80 pb-3">
        <h3 className="text-sm font-bold text-gray-900">3. Booking Summary</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          Price Locked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-500 block">Service</span>
          <span className="font-semibold text-gray-900 text-sm mt-0.5 block">{service.title}</span>
        </div>

        <div>
          <span className="text-gray-500 block">Service Provider</span>
          <span className="font-semibold text-gray-900 text-sm mt-0.5 block">
            {service.provider?.name || 'Verified Provider'}
          </span>
        </div>

        <div>
          <span className="text-gray-500 block">Date & Time</span>
          <span className="font-semibold text-gray-900 text-sm mt-0.5 block">
            {selectedDate} ({selectedSlot.startTime} – {selectedSlot.endTime})
          </span>
        </div>

        <div>
          <span className="text-gray-500 block">Duration</span>
          <span className="font-semibold text-gray-900 text-sm mt-0.5 block">
            {service.durationMinutes} minutes
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-indigo-100/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Total Amount
        </span>
        <span className="text-xl font-extrabold text-indigo-900">
          {formatPrice(service.price)}
        </span>
      </div>

      <div className="flex items-center text-[11px] text-gray-500 bg-white/70 p-2.5 rounded-lg border border-indigo-100/60">
        <svg
          className="w-4 h-4 mr-1.5 text-indigo-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
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
