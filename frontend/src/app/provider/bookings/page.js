'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { providerApi } from '../../../lib/providerApi';
import { ROUTES } from '../../../utils/routes';
import AuthGuard from '../../../components/auth/AuthGuard';
import BookingStatusBadge from '../../../components/bookings/BookingStatusBadge';
import RejectBookingModal from '../../../components/provider/RejectBookingModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Button from '../../../components/common/Button';

const STATUS_TABS = [
  { label: 'All Bookings', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Declined', value: 'REJECTED' },
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

export default function ProviderBookingsPage() {
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

  // Accept & Reject Action state
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);
  const [actionErrorMessage, setActionErrorMessage] = useState(null);

  /**
   * Fetch bookings scheduled for the authenticated provider.
   */
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await providerApi.getProviderBookings({
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
      setError(err.message || 'Unable to load incoming bookings.');
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
    setActionErrorMessage(null);
  };

  /**
   * Provider accepts a pending booking (PENDING -> CONFIRMED).
   */
  const handleAcceptBooking = async (bookingId) => {
    if (acceptingId) return;

    setAcceptingId(bookingId);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);

    try {
      await providerApi.acceptBooking(bookingId);
      setActionSuccessMessage(`Booking #${bookingId} has been confirmed successfully.`);
      await fetchBookings();
    } catch (err) {
      setActionErrorMessage(
        err.status === 409
          ? 'This booking state has already been modified or cancelled. Refreshing latest status...'
          : err.message || 'Failed to accept booking.'
      );
      await fetchBookings();
    } finally {
      setAcceptingId(null);
    }
  };

  /**
   * Provider rejects a pending booking (PENDING -> REJECTED).
   */
  const handleConfirmReject = async () => {
    if (!rejectModalBooking) return;

    setIsRejecting(true);
    setRejectError(null);

    try {
      await providerApi.rejectBooking(rejectModalBooking.id);
      setActionSuccessMessage(
        `Booking #${rejectModalBooking.id} was declined and the time slot has been released.`
      );
      setRejectModalBooking(null);
      await fetchBookings();
    } catch (err) {
      setRejectError(
        err.status === 409
          ? 'This booking state has already been modified or cancelled.'
          : err.message || 'Failed to decline booking.'
      );
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['PROVIDER']}>
      <div className="flex-1 py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:flex sm:items-center sm:justify-between border-b border-gray-200/80 pb-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Link
                  href={ROUTES.PROVIDER_DASHBOARD}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  ← Provider Dashboard
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Customer Booking Requests
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Review incoming appointment requests, accept bookings into your schedule, or decline conflicts.
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <Link href="/provider/schedule">
                <Button variant="outline" size="md" className="font-semibold">
                  View Work Schedule →
                </Button>
              </Link>
            </div>
          </div>

          {/* Success Banner */}
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

          {/* Error Banner */}
          {actionErrorMessage && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{actionErrorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionErrorMessage(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex overflow-x-auto scrollbar-none gap-2 pb-4 mb-6">
            {STATUS_TABS.map((tab) => {
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
              <LoadingSpinner size="lg" label="Loading booking requests..." />
              <p className="mt-3 text-sm text-gray-500 font-medium">Fetching customer requests...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
              <h3 className="text-base font-bold text-red-900">Error Loading Requests</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchBookings} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-xl mx-auto shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {statusFilter ? `No ${statusFilter.toLowerCase()} bookings found` : 'No booking requests received yet'}
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {statusFilter
                  ? 'There are no booking requests currently matching this status filter.'
                  : 'When customers book your services from the marketplace catalog, their requests will appear here for your review.'}
              </p>
              {statusFilter && (
                <div className="mt-6">
                  <Button variant="outline" size="md" onClick={() => handleStatusChange('')}>
                    View All Bookings
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Booking Request Cards */}
              {bookings.map((booking) => {
                const isPending = booking.status === 'PENDING';
                const isProcessing = acceptingId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    {/* Left Details */}
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

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Customer: <strong className="text-gray-900 font-semibold ml-1">{booking.customer?.name || 'Customer'}</strong>
                          {booking.customer?.email && (
                            <span className="text-gray-400 ml-1">({booking.customer.email})</span>
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          Payout: <strong className="text-gray-900 font-bold">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
                      {isPending ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={Boolean(acceptingId)}
                            onClick={() => {
                              setRejectModalBooking(booking);
                              setRejectError(null);
                            }}
                            className="text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            Decline
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isProcessing}
                            disabled={Boolean(acceptingId)}
                            onClick={() => handleAcceptBooking(booking.id)}
                            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                          >
                            Accept Booking
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">
                          No further actions available
                        </span>
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

          {/* Decline Confirmation Modal */}
          {rejectModalBooking && (
            <RejectBookingModal
              booking={rejectModalBooking}
              onClose={() => setRejectModalBooking(null)}
              onConfirm={handleConfirmReject}
              isRejecting={isRejecting}
              error={rejectError}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
