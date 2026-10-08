'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import AuthGuard from '../../../components/auth/AuthGuard';
import { providerApi } from '../../../lib/providerApi';
import BookingStatusBadge from '../../../components/bookings/BookingStatusBadge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { ROUTES } from '../../../utils/routes';

function ScheduleContent() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewFilter, setViewFilter] = useState('UPCOMING'); // 'UPCOMING' | 'ALL' | 'CONFIRMED' | 'PAST'
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await providerApi.getProviderBookings({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      } else if (Array.isArray(res.items)) {
        setBookings(res.items);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      setError(err.message || 'Unable to load schedule appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentTimestamp(Date.now());
    fetchSchedule();
  }, [fetchSchedule]);

  // Helper to construct a proper Date object from booking date and time
  const getBookingDateTime = (booking) => {
    try {
      const datePart = typeof booking.bookingDate === 'string' 
        ? booking.bookingDate.split('T')[0] 
        : new Date(booking.bookingDate).toISOString().split('T')[0];
      return new Date(`${datePart}T${booking.startTime}`);
    } catch {
      return new Date(booking.bookingDate);
    }
  };

  // Filter bookings based on view filter
  const filteredBookings = bookings.filter((b) => {
    const bookingDt = getBookingDateTime(b);
    const isPast = currentTimestamp > 0 ? bookingDt.getTime() < currentTimestamp : false;

    if (viewFilter === 'UPCOMING') {
      return !isPast && (b.status === 'CONFIRMED' || b.status === 'PENDING');
    }
    if (viewFilter === 'CONFIRMED') {
      return b.status === 'CONFIRMED';
    }
    if (viewFilter === 'PAST') {
      return isPast || b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'REJECTED';
    }
    return true; // 'ALL'
  });

  // Sort: Nearest upcoming first for UPCOMING/CONFIRMED/ALL, most recent first for PAST
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dtA = getBookingDateTime(a);
    const dtB = getBookingDateTime(b);
    if (viewFilter === 'PAST') {
      return dtB - dtA;
    }
    return dtA - dtB;
  });

  // Group by Date string
  const groupedBookings = sortedBookings.reduce((acc, booking) => {
    const dateStr = typeof booking.bookingDate === 'string'
      ? booking.bookingDate.split('T')[0]
      : new Date(booking.bookingDate).toISOString().split('T')[0];
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(booking);
    return acc;
  }, {});

  const formatDateHeader = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      const now = new Date();
      const isToday = now.toDateString() === d.toDateString();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = tomorrow.toDateString() === d.toDateString();

      const formatted = d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      if (isToday) return `Today — ${formatted}`;
      if (isTomorrow) return `Tomorrow — ${formatted}`;
      return formatted;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              <span>Provider Portal</span>
              <span>•</span>
              <span>Work Schedule</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Appointment Schedule
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Organized chronological agenda of all upcoming and past service sessions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSchedule}
              disabled={loading}
              className="flex items-center space-x-1.5"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </Button>
            <Link href={ROUTES.PROVIDER_BOOKINGS}>
              <Button variant="primary" size="sm">
                View Requests
              </Button>
            </Link>
          </div>
        </div>

        {/* View Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-1 overflow-x-auto">
          {[
            { id: 'UPCOMING', label: 'Upcoming Schedule' },
            { id: 'CONFIRMED', label: 'Confirmed Only' },
            { id: 'PAST', label: 'Past & Inactive' },
            { id: 'ALL', label: 'All Appointments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                viewFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-medium">Loading schedule timeline...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-medium text-red-800 mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchSchedule}>
              Try Again
            </Button>
          </div>
        ) : Object.keys(groupedBookings).length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No appointments found
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              {viewFilter === 'UPCOMING'
                ? 'You have no upcoming confirmed or pending appointments scheduled.'
                : `No appointments found matching the "${viewFilter.toLowerCase()}" filter.`}
            </p>
            <Link href={ROUTES.PROVIDER_BOOKINGS}>
              <Button variant="primary" size="sm">
                Check Booking Requests
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedBookings).map(([dateStr, dayBookings]) => (
              <div key={dateStr} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {formatDateHeader(dateStr)}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {dayBookings.length} session{dayBookings.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Appointments in this date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Status bar highlight */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-emerald-500'
                            : booking.status === 'PENDING'
                            ? 'bg-amber-500'
                            : booking.status === 'COMPLETED'
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                      />

                      <div>
                        {/* Top row: Time and Status */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center space-x-1.5 text-sm font-bold text-gray-900">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          <BookingStatusBadge status={booking.status} />
                        </div>

                        {/* Service Title */}
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {booking.service?.title || 'Service Session'}
                        </h3>

                        {/* Customer Info */}
                        <div className="flex items-center space-x-2 text-xs text-gray-600 mb-4">
                          <span className="font-semibold text-gray-800">
                            Customer:
                          </span>
                          <span>{booking.customer?.name || 'Customer'}</span>
                          {booking.customer?.email && (
                            <>
                              <span>•</span>
                              <span className="text-gray-500">{booking.customer.email}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Bottom row: Price & Duration info */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Duration: <strong className="text-gray-900">{booking.service?.duration || 60} mins</strong>
                        </span>
                        <span className="text-base font-bold text-gray-900">
                          ₹{Number(booking.totalPrice || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProviderSchedulePage() {
  return (
    <AuthGuard allowedRoles={['PROVIDER']}>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50/50 py-16 flex items-center justify-center">
            <LoadingSpinner size="lg" label="Loading schedule..." />
          </div>
        }
      >
        <ScheduleContent />
      </Suspense>
    </AuthGuard>
  );
}
