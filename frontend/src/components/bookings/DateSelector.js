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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="booking-date" className="block text-sm font-semibold text-gray-900">
          1. Select Appointment Date <span className="text-red-500">*</span>
        </label>
        {selectedDate && (
          <span className="text-xs text-indigo-600 font-medium">
            Selected: {selectedDate}
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
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      {/* Quick Date Shortcut Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Quick select:</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDateChange(todayStr)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            selectedDate === todayStr
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDateChange(tomorrowStr)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            selectedDate === tomorrowStr
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tomorrow
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDateChange(inTwoDaysStr)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            selectedDate === inTwoDaysStr
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In 2 Days
        </button>
      </div>
    </div>
  );
}
