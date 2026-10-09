'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { bookingApi } from '../../lib/bookingApi';
import DateSelector from './DateSelector';
import TimeSlotPicker from './TimeSlotPicker';
import BookingSummary from './BookingSummary';
import BookingSuccess from './BookingSuccess';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

export default function BookingForm({ service }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [conflictNotice, setConflictNotice] = useState(null);

  const [createdBooking, setCreatedBooking] = useState(null);

  const conflictAlertRef = useRef(null);

  /**
   * Fetch availability for the selected date.
   */
  const fetchAvailability = useCallback(
    async (dateStr) => {
      if (!dateStr || !service?.id) return;

      setIsLoadingAvailability(true);
      setAvailabilityError(null);
      setSelectedSlot(null);

      try {
        const data = await bookingApi.getAvailability({
          serviceId: service.id,
          bookingDate: dateStr,
        });
        setSlots(data.slots || []);
      } catch (err) {
        setAvailabilityError(err.message || 'Unable to fetch available time slots.');
        setSlots([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    },
    [service]
  );

  /**
   * Handle date change from DateSelector.
   */
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setBookingError(null);
    setConflictNotice(null);
    fetchAvailability(newDate);
  };

  /**
   * Handle slot selection.
   */
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setBookingError(null);
    setConflictNotice(null);
  };

  /**
   * Handle booking confirmation submission.
   */
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (isSubmitting || !selectedDate || !selectedSlot) return;

    setIsSubmitting(true);
    setBookingError(null);
    setConflictNotice(null);

    try {
      const response = await bookingApi.createBooking({
        serviceId: service.id,
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      setCreatedBooking(response);
    } catch (err) {
      if (err.status === 409) {
        // Critical Concurrency 409 Conflict Handling:
        // Another customer just booked this slot.
        setConflictNotice(
          'This time slot was just booked by another customer. Schedule has been updated with the latest availability.'
        );
        // 1. Clear currently selected slot
        setSelectedSlot(null);
        // 2. Refresh availability for current date to show updated slots
        await fetchAvailability(selectedDate);
        // 3. Move focus to conflict notice
        setTimeout(() => {
          conflictAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        setBookingError(err.message || 'Failed to place booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset form to book another appointment.
   */
  const handleResetForm = () => {
    setCreatedBooking(null);
    setSelectedSlot(null);
    setBookingError(null);
    setConflictNotice(null);
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  };

  // If booking was placed successfully, display confirmation state
  if (createdBooking) {
    return <BookingSuccess booking={createdBooking} onBookAnother={handleResetForm} />;
  }

  return (
    <div className="space-y-6">
      {/* 409 Conflict Alert Notice */}
      {conflictNotice && (
        <div
          ref={conflictAlertRef}
          tabIndex={-1}
          role="alert"
          className="rounded-sm border border-[#111111] bg-[#F7F7F7] p-4 text-[#111111] flex items-start space-x-3"
        >
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-[#111111]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <strong className="block font-bold">Slot No Longer Available</strong>
            <p className="mt-0.5">{conflictNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setConflictNotice(null)}
            className="text-[#666666] hover:text-[#111111] focus:outline-none focus-visible:ring-1 focus-visible:ring-black rounded-sm"
            aria-label="Dismiss conflict notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* General Booking Error Alert */}
      {bookingError && (
        <ErrorMessage
          message={bookingError}
          onDismiss={() => setBookingError(null)}
        />
      )}

      {/* 1. Date Selector */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        disabled={isSubmitting}
      />

      {/* 2. Time Slot Picker */}
      <TimeSlotPicker
        slots={slots}
        selectedSlot={selectedSlot}
        onSlotSelect={handleSlotSelect}
        isLoading={isLoadingAvailability}
        error={availabilityError}
        dateSelected={Boolean(selectedDate)}
      />

      {/* 3. Booking Summary (Visible once slot is selected) */}
      {selectedDate && selectedSlot && (
        <BookingSummary
          service={service}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
        />
      )}

      {/* 4. Confirm Booking Button */}
      {selectedDate && selectedSlot && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirmBooking}
            isLoading={isSubmitting}
            disabled={isSubmitting || !selectedSlot}
            className="w-full font-bold py-3.5"
          >
            Confirm &amp; Book Appointment →
          </Button>
        </div>
      )}
    </div>
  );
}
