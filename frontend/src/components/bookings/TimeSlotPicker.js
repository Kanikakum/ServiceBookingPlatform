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
      <div className="rounded-sm border border-dashed border-[#E5E5E5] bg-[#F7F7F7] p-6 text-center text-sm text-[#666666]">
        <svg className="w-6 h-6 mx-auto mb-2 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Please select an appointment date above to view available time slots.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-sm border border-[#E5E5E5] bg-[#F7F7F7] p-8 flex flex-col items-center justify-center">
        <LoadingSpinner size="md" label="Checking time slot availability..." />
        <p className="mt-3 text-xs text-[#666666] font-medium">Checking live schedule availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm bg-[#F7F7F7] border border-[#111111] p-4 text-sm text-[#111111]">
        <p className="font-semibold">Unable to fetch available slots</p>
        <p className="mt-1 text-[#666666]">{error}</p>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="rounded-sm border border-[#E5E5E5] bg-[#F7F7F7] p-6 text-center">
        <p className="font-semibold text-sm text-[#111111]">No slots available on this date</p>
        <p className="mt-1 text-xs text-[#666666]">
          The service provider is fully booked or outside standard operating hours for this date. Please try choosing another day.
        </p>
      </div>
    );
  }

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#111111]">
          2. Select Time Slot <span className="text-[#666666]" aria-hidden="true">*</span>
        </label>
        <span className="text-xs text-[#666666] font-medium">
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
              className={`p-3 rounded-sm border text-center transition-all duration-150 relative select-none ${
                isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'
              } ${
                isSelected
                  ? 'bg-[#111111] border-[#111111] text-white ring-1 ring-[#111111]'
                  : isAvailable
                  ? 'bg-white border-[#E5E5E5] text-[#111111] hover:border-[#111111] hover:bg-[#F7F7F7]'
                  : 'bg-[#F7F7F7] border-[#E5E5E5] text-[#666666] opacity-60'
              }`}
            >
              <div className="text-sm font-bold tracking-tight">
                {slot.startTime} – {slot.endTime}
              </div>
              <span
                className={`block text-[10px] mt-1 font-semibold uppercase tracking-wider ${
                  isSelected
                    ? 'text-gray-300'
                    : isAvailable
                    ? 'text-[#666666]'
                    : 'text-[#666666]'
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
