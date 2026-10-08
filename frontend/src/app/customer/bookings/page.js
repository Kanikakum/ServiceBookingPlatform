'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { bookingApi } from '../../../lib/bookingApi';
import { ROUTES } from '../../../utils/routes';
import AuthGuard from '../../../components/auth/AuthGuard';
import BookingStatusBadge from '../../../components/bookings/BookingStatusBadge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';

const STATUS_FILTERS = [
  { label: 'All Bookings', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Completed', value: 'COMPLETED' },
];

/**
 * Format ISO time into HH:mm UTC or local.
 */
const formatTimeRange = (startTimeStr, endTimeStr) => {
  if (!startTimeStr || !endTimeStr) return 'N/A';
  const start = new Date(startTimeStr);
  const end = new Date(endTimeStr);

  const format = (d) => {
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return `${format(start)} – ${format(end)}`;
};

export default function CustomerBookingsPage() {
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

  // Cancellation state
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  /**
   * Fetch customer bookings with active filters and pagination.
   */
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await bookingApi.getCustomerBookings({
        status: statusFilter || undefined,
        page,
        limit: 10,
      });

      setBookings(data.items || []);
      setPagination(
        data.pagination || {
          page,
          limit: 10,
          totalItems: data.items?.length || 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err.message || 'Unable to load your bookings.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /**
   * Handle status filter tab change.
   */
  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
    setActionSuccessMessage(null);
  };

  /**
   * Confirm and execute booking cancellation.
   */
  const handleExecuteCancel = async () => {
    if (!cancelModalBooking) return;

    setCancellingId(cancelModalBooking.id);
    setCancelError(null);

    try {
      await bookingApi.cancelBooking(cancelModalBooking.id);
      setActionSuccessMessage(
        `Booking #${cancelModalBooking.id} for "${cancelModalBooking.service?.title}" was successfully cancelled.`
      );
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <AuthGuard allowedRoles={['CUSTOMER']}>
      <div className="flex-1 py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Quick Action */}
          <div className="mb-8 sm:flex sm:items-center sm:justify-between border-b border-gray-200/80 pb-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Link
                  href={ROUTES.CUSTOMER_DASHBOARD}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  ← Customer Dashboard
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                My Bookings & Appointments
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                View your appointment schedule, check confirmation status, and manage cancellations.
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <Link href={ROUTES.SERVICES}>
                <Button variant="primary" size="md" className="font-semibold shadow-2xs">
                  + Book New Service
                </Button>
              </Link>
            </div>
          </div>

          {/* Action Success Alert */}
          {actionSuccessMessage && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{actionSuccessMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionSuccessMessage(null)}
                className="text-emerald-600 hover:text-emerald-800"
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
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
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
              <p className="mt-3 text-sm text-gray-500 font-medium">Retrieving your appointments...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
              <h3 className="text-base font-bold text-red-900">Error Loading Bookings</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={fetchBookings}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-xl mx-auto shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {statusFilter ? `No ${statusFilter.toLowerCase()} bookings found` : 'No bookings yet'}
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {statusFilter
                  ? 'There are no bookings matching this status filter.'
                  : "You haven't scheduled any service appointments yet. Explore verified local services and book your first appointment!"}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {statusFilter ? (
                  <Button variant="outline" size="md" onClick={() => handleStatusChange('')}>
                    View All Bookings
                  </Button>
                ) : (
                  <Link href={ROUTES.SERVICES}>
                    <Button variant="primary" size="md">
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
                    className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    {/* Booking Main Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          #{booking.id}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {booking.bookingDate}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({formatTimeRange(booking.startTime, booking.endTime)})
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">
                        {booking.service?.title || 'Service Appointment'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span>
                          Provider: <strong className="text-gray-700 font-medium">{booking.provider?.name || 'Assigned Provider'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Locked Price: <strong className="text-gray-900 font-bold">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Duration: <strong className="text-gray-700 font-medium">{booking.service?.durationMinutes || 60} min</strong>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
                      {booking.service?.id && (
                        <Link href={`/services/${booking.service.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs font-medium text-indigo-600">
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
                          className="text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
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
                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    ← Previous
                  </Button>
                  <span className="text-xs font-medium text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Confirmation Modal */}
          {cancelModalBooking && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">Cancel Appointment?</h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Are you sure you want to cancel booking{' '}
                    <strong className="text-gray-900 font-mono">#{cancelModalBooking.id}</strong> for{' '}
                    <strong className="text-gray-900">{cancelModalBooking.service?.title}</strong> on{' '}
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
                    className="flex-1"
                  >
                    Keep Booking
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    isLoading={Boolean(cancellingId)}
                    disabled={Boolean(cancellingId)}
                    onClick={handleExecuteCancel}
                    className="flex-1"
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
