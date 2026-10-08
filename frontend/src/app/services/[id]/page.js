'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { serviceApi } from '../../../lib/serviceApi';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../utils/routes';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Button from '../../../components/common/Button';

/**
 * Format duration in minutes into a human-friendly string.
 */
const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return 'N/A';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
};

/**
 * Format numeric price with currency symbol.
 */
const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

function ServiceDetailContent({ params }) {
  // In Next.js 15/16 App Router, params is a Promise in client components
  const resolvedParams = use(params);
  const serviceId = resolvedParams.id;

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingNotice, setShowBookingNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchService = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await serviceApi.getServiceById(serviceId);
        if (isMounted) {
          setService(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.status === 404 ? 'Service not found' : err.message);
          setIsLoading(false);
        }
      }
    };

    if (serviceId) {
      fetchService();
    }

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  if (isLoading) {
    return (
      <div className="flex-1 py-24 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" label="Loading service details..." />
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading service information...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Service Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error === 'Service not found'
              ? 'The requested service may have been deactivated or does not exist.'
              : error || 'Unable to load service details.'}
          </p>
          <div className="mt-6">
            <Link href="/services">
              <Button variant="primary" size="md">
                ← Back to Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const isProvider = isAuthenticated && user?.role === 'PROVIDER';

  return (
    <div className="flex-1 py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Marketplace
          </Link>
        </div>

        {/* Main Service Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 sm:p-10 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30">
                {service.category?.name || 'Service Category'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                Active & Verified
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{service.title}</h1>

            <p className="mt-2 text-indigo-200 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Offered by <strong className="text-white ml-1 font-semibold">{service.provider?.name || 'Professional Provider'}</strong>
            </p>
          </div>

          {/* Body Information */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Quick Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Standard Price
                </span>
                <span className="text-2xl font-extrabold text-gray-900 mt-0.5 block">
                  {formatPrice(service.price)}
                </span>
              </div>

              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Estimated Duration
                </span>
                <span className="text-base font-bold text-gray-800 mt-1 block">
                  {formatDuration(service.durationMinutes)}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Availability Guarantee
                </span>
                <span className="text-sm font-semibold text-emerald-700 mt-1 block">
                  Zero Double-Booking
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Service Description</h2>
              <div className="prose prose-indigo text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {service.description}
              </div>
            </div>

            {/* Booking Call-To-Action Box */}
            <div className="pt-6 border-t border-gray-100">
              {!isAuthenticated ? (
                <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Ready to book this service?</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Sign in with your Customer account to select available dates and time slots.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => router.push(ROUTES.LOGIN)}
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    Login to Book
                  </Button>
                </div>
              ) : isCustomer ? (
                <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Customer
                        </span>
                        <h3 className="text-base font-bold text-gray-900">Book Appointment</h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Locked price of <strong className="text-gray-900">{formatPrice(service.price)}</strong> with{' '}
                        {formatDuration(service.durationMinutes)} service duration.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowBookingNotice(true)}
                      className="w-full sm:w-auto shadow-md"
                    >
                      Book This Service
                    </Button>
                  </div>

                  {showBookingNotice && (
                    <div className="mt-4 p-4 rounded-xl bg-white border border-indigo-200 text-xs text-indigo-900 shadow-2xs">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <strong className="font-semibold block text-sm">Booking Calendar Coming in Phase 4C</strong>
                          <p className="mt-0.5 text-gray-600">
                            The live slot picker wired to <code className="bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-indigo-800">/api/bookings/availability</code> and the ACID concurrency booking engine will be integrated in Phase 4C!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : isProvider ? (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 flex items-center space-x-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    You are signed in as a <strong>Service Provider</strong>. Customer accounts are required to book appointments.
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage(props) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 py-24 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" label="Loading service details..." />
        </div>
      }
    >
      <ServiceDetailContent {...props} />
    </Suspense>
  );
}
