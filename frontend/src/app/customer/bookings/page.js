'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import AuthGuard from '../../../components/auth/AuthGuard';
import { bookingApi } from '../../../lib/bookingApi';
import { ROUTES } from '../../../utils/routes';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import BookingStatusBadge from '../../../components/bookings/BookingStatusBadge';
import ErrorMessage from '../../../components/common/ErrorMessage';

const STATUS_FILTERS = [
  { label: 'All Bookings', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Declined', value: 'REJECTED' },
];

/**
 * Format time string HH:MM:SS to 12-hour AM/PM format.
 */
const formatTimeRange = (startTime, endTime) => {
  if (!startTime) return '';
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  if (!endTime) return formatTime(startTime);
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
};

export default function CustomerBookingsPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for cancellation confirmation
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  /**
   * Fetch customer bookings list from API.
   */
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) {
        params.status = statusFilter;
      }

      const data = await bookingApi.getCustomerBookings(params);
      if (data && Array.isArray(data.items)) {
        setBookings(data.items);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
      setError(err.message || 'Unable to load your bookings. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /**
   * Filter tab selection handler.
   */
  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
    setActionSuccessMessage(null);
  };

  /**
   * Cancel booking execution handler.
   */
  const handleExecuteCancel = async () => {
    if (!cancelModalBooking) return;
    setCancellingId(cancelModalBooking.id);
    setCancelError(null);

    try {
      await bookingApi.cancelBooking(cancelModalBooking.id);
      setActionSuccessMessage(
        `Booking #${cancelModalBooking.id} for "${cancelModalBooking.service?.title || 'Service'}" was successfully cancelled.`
      );
      setCancelModalBooking(null);
      // Refresh list
      await fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setCancelError(err.message || 'Could not cancel this booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <AuthGuard allowedRoles={['CUSTOMER']}>
      <div className="flex-1 py-10 bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Quick Action */}
          <div className="mb-8 sm:flex sm:items-center sm:justify-between border-b border-[#E5E5E5] pb-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Link
                  href={ROUTES.CUSTOMER_DASHBOARD}
                  className="text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors"
                >
                  ← Customer Dashboard
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                My Bookings &amp; Appointments
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] mt-1">
                View your appointment schedule, check confirmation status, and manage cancellations.
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <Link href={ROUTES.SERVICES}>
                <Button variant="primary" size="md" className="font-semibold rounded-sm shadow-xs">
                  + Book New Service
                </Button>
              </Link>
            </div>
          </div>

          {/* Action Success Alert */}
          {actionSuccessMessage && (
            <div className="mb-6 rounded-sm bg-white border border-[#111111] p-4 text-xs sm:text-sm text-[#111111] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#111111] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{actionSuccessMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionSuccessMessage(null)}
                className="text-[#666666] hover:text-[#111111] cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex overflow-x-auto scrollbar-none gap-2 pb-4 mb-6">
            {STATUS_FILTERS.map((tab) => {
              const isSelected = statusFilter === tab.value;
              return (
                <button
                  key={tab.value || 'ALL'}
                  type="button"
                  onClick={() => handleStatusChange(tab.value)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-white text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111] border border-[#E5E5E5]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content States */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <LoadingSpinner size="lg" label="Loading customer bookings..." />
              <p className="mt-3 text-sm text-[#666666] font-medium">Retrieving your appointments...</p>
            </div>
          ) : error ? (
            <div className="bg-white border border-[#E5E5E5] rounded-sm p-8 text-center max-w-lg mx-auto">
              <h3 className="text-base font-bold text-[#111111]">Error Loading Bookings</h3>
              <p className="mt-1 text-sm text-[#666666]">{error}</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={fetchBookings} className="rounded-sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#E5E5E5] p-12 text-center max-w-xl mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-sm bg-[#111111] text-white flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#111111]">
                {statusFilter ? `No ${statusFilter.toLowerCase()} bookings found` : 'No bookings yet'}
              </h2>
              <p className="mt-2 text-sm text-[#666666] leading-relaxed">
                {statusFilter
                  ? 'There are no bookings matching this status filter.'
                  : "You haven't scheduled any service appointments yet. Explore verified local services and book your first appointment!"}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {statusFilter ? (
                  <Button variant="outline" size="md" onClick={() => handleStatusChange('')} className="rounded-sm">
                    View All Bookings
                  </Button>
                ) : (
                  <Link href={ROUTES.SERVICES}>
                    <Button variant="primary" size="md" className="rounded-sm">
                      Browse Services →
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bookings List */}
              {bookings.map((booking) => {
                const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-sm border border-[#E5E5E5] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    {/* Booking Main Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#111111] bg-[#F7F7F7] border border-[#E5E5E5] px-2 py-0.5 rounded-sm">
                          #{booking.id}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                        <span className="text-xs text-[#666666]">•</span>
                        <span className="text-xs font-semibold text-[#111111]">
                          {booking.bookingDate}
                        </span>
                        <span className="text-xs text-[#666666]">
                          ({formatTimeRange(booking.startTime, booking.endTime)})
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#111111]">
                        {booking.service?.title || 'Service Appointment'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#666666]">
                        <span>
                          Provider: <strong className="text-[#111111] font-medium">{booking.provider?.name || 'Assigned Provider'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Locked Price: <strong className="text-[#111111] font-bold">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Duration: <strong className="text-[#111111] font-medium">{booking.service?.durationMinutes || 60} min</strong>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E5E5] justify-end">
                      {booking.service?.id && (
                        <Link href={`/services/${booking.service.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs font-medium text-[#111111] rounded-sm hover:bg-[#F7F7F7]">
                            View Service
                          </Button>
                        </Link>
                      )}

                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCancelModalBooking(booking);
                            setCancelError(null);
                          }}
                          className="text-xs font-medium text-[#111111] border-[#E5E5E5] hover:bg-[#F7F7F7] rounded-sm"
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-[#E5E5E5] pt-6">
                  <p className="text-xs text-[#666666]">
                    Showing Page <strong className="text-[#111111]">{pagination.page}</strong> of{' '}
                    <strong className="text-[#111111]">{pagination.totalPages}</strong> ({pagination.totalItems} total bookings)
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Confirmation Modal */}
          {cancelModalBooking && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-sm max-w-md w-full p-6 sm:p-8 shadow-xl border border-[#E5E5E5] space-y-4">
                <div className="w-10 h-10 rounded-sm bg-[#111111] text-white flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#111111]">Cancel Appointment?</h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#666666] leading-relaxed">
                    Are you sure you want to cancel booking{' '}
                    <strong className="text-[#111111] font-mono">#{cancelModalBooking.id}</strong> for{' '}
                    <strong className="text-[#111111]">{cancelModalBooking.service?.title}</strong> on{' '}
                    {cancelModalBooking.bookingDate}? This will immediately release the reserved time slot.
                  </p>
                </div>

                {cancelError && <ErrorMessage message={cancelError} />}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    disabled={Boolean(cancellingId)}
                    onClick={() => setCancelModalBooking(null)}
                    className="flex-1 rounded-sm"
                  >
                    Keep Booking
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={Boolean(cancellingId)}
                    disabled={Boolean(cancellingId)}
                    onClick={handleExecuteCancel}
                    className="flex-1 rounded-sm"
                  >
                    Yes, Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
