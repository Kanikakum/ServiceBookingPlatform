import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function TimeSlotPicker({
  slots = [],
  selectedSlot = null,
  onSlotSelect,
  isLoading = false,
  error = null,
  dateSelected = false,
}) {
  if (!dateSelected) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-xs text-gray-500">
        Please select an appointment date above to view available time slots.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-8 flex flex-col items-center justify-center">
        <LoadingSpinner size="md" label="Checking time slot availability..." />
        <p className="mt-3 text-xs text-gray-500 font-medium">Checking live schedule availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
        <p className="font-semibold">Unable to fetch available slots</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 text-center text-xs text-amber-800">
        <p className="font-semibold text-sm">No slots available on this date</p>
        <p className="mt-1 text-gray-600">The service provider is fully booked or outside standard operating hours for this date. Please try choosing another day.</p>
      </div>
    );
  }

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">
          2. Select Time Slot <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-500 font-medium">
          {availableCount} of {slots.length} slots available
        </span>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
        role="radiogroup"
        aria-label="Available appointment time slots"
      >
        {slots.map((slot, index) => {
          const isSelected = selectedSlot && selectedSlot.startTime === slot.startTime;
          const isAvailable = slot.available;

          return (
            <button
              key={`${slot.startTime}-${index}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!isAvailable}
              onClick={() => onSlotSelect(slot)}
              className={`p-3 rounded-xl border text-center transition-all duration-150 relative select-none cursor-pointer disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-500/30 shadow-xs'
                  : isAvailable
                  ? 'bg-white border-gray-200 text-gray-900 hover:border-indigo-400 hover:bg-indigo-50/40 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
              }`}
            >
              <div className="text-sm font-bold tracking-tight">
                {slot.startTime} – {slot.endTime}
              </div>
              <span
                className={`block text-[10px] mt-1 font-semibold uppercase tracking-wider ${
                  isSelected
                    ? 'text-indigo-100'
                    : isAvailable
                    ? 'text-emerald-600'
                    : 'text-gray-400'
                }`}
              >
                {isSelected ? '✓ Selected' : isAvailable ? 'Available' : 'Booked'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
