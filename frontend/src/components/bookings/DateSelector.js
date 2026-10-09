import React from 'react';

/**
 * Get formatted YYYY-MM-DD string with optional day offset in local/UTC.
 */
const getFormattedDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DateSelector({ selectedDate, onDateChange, disabled = false }) {
  const todayStr = getFormattedDate(0);
  const tomorrowStr = getFormattedDate(1);
  const inTwoDaysStr = getFormattedDate(2);

  const quickBtnClass = (isActive) =>
    `px-3 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed ${
      isActive
        ? 'bg-[#111111] text-white'
        : 'bg-[#F7F7F7] text-[#666666] hover:bg-[#E5E5E5] hover:text-[#111111] border border-[#E5E5E5]'
    }`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="booking-date" className="block text-sm font-semibold text-[#111111]">
          1. Select Appointment Date <span className="text-[#666666]" aria-hidden="true">*</span>
        </label>
        {selectedDate && (
          <span className="text-xs text-[#666666] font-medium">
            Selected: <strong className="text-[#111111]">{selectedDate}</strong>
          </span>
        )}
      </div>

      {/* Date Picker Input */}
      <div className="relative">
        <input
          type="date"
          id="booking-date"
          name="bookingDate"
          min={todayStr}
          value={selectedDate}
          disabled={disabled}
          onChange={(e) => onDateChange(e.target.value)}
          aria-label="Select appointment date"
          className="w-full px-3.5 py-2.5 rounded-sm border border-[#E5E5E5] bg-white text-sm text-[#111111] focus:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:border-[#111111] disabled:bg-[#F7F7F7] disabled:cursor-not-allowed transition-colors hover:border-[#666666]"
        />
      </div>

      {/* Quick Date Shortcut Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#666666] font-medium">Quick select:</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDateChange(todayStr)}
          className={quickBtnClass(selectedDate === todayStr)}
        >
          Today
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDateChange(tomorrowStr)}
          className={quickBtnClass(selectedDate === tomorrowStr)}
        >
          Tomorrow
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDateChange(inTwoDaysStr)}
          className={quickBtnClass(selectedDate === inTwoDaysStr)}
        >
          In 2 Days
        </button>
      </div>
    </div>
  );
}
