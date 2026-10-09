'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { providerApi } from '../../lib/providerApi';
import { ROUTES } from '../../utils/routes';
import AuthGuard from '../../components/auth/AuthGuard';
import ProviderStatsCard from '../../components/provider/ProviderStatsCard';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

export default function ProviderDashboardPage() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    upcomingBookingsCount: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load real backend data to compute provider statistics.
   */
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [servicesData, bookingsData] = await Promise.all([
        providerApi.getProviderServices({ limit: 50 }),
        providerApi.getProviderBookings({ limit: 50 }),
      ]);

      const services = servicesData.items || [];
      const bookings = bookingsData.items || [];

      const activeServices = services.filter((s) => s.isActive).length;
      const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
      const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;

      const now = new Date();
      const upcoming = bookings.filter((b) => {
        const bookingDate = new Date(b.bookingDate);
        return (
          ['PENDING', 'CONFIRMED'].includes(b.status) &&
          bookingDate.getTime() >= new Date(now.toISOString().split('T')[0]).getTime()
        );
      });

      setStats({
        totalServices: servicesData.pagination?.totalItems || services.length,
        activeServices,
        pendingBookings,
        confirmedBookings,
        upcomingBookingsCount: upcoming.length,
      });

      // Keep recent 5 bookings for quick view
      setRecentBookings(bookings.slice(0, 5));
    } catch (err) {
      setError(err.message || 'Unable to load provider dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <AuthGuard allowedRoles={['PROVIDER']}>
      <div className="flex-1 py-10 bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome & Profile Header */}
          <div className="bg-white rounded-sm border border-[#E5E5E5] p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5]">
                    Service Provider Hub
                  </span>
                  <span className="text-xs text-[#666666]">•</span>
                  <span className="text-xs text-[#666666] font-mono">ID #{user?.id}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-xs sm:text-sm text-[#666666] mt-1">
                  Manage your service listings, handle customer booking requests, and organize your work schedule.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Link href="/provider/services/new">
                  <Button variant="primary" size="md" className="font-semibold rounded-sm">
                    + Add New Service
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="rounded-sm border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F7]"
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>

          {/* KPI Statistics Grid */}
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <LoadingSpinner size="lg" label="Loading provider statistics..." />
              <p className="mt-3 text-xs text-[#666666] font-medium">Computing your dashboard metrics...</p>
            </div>
          ) : error ? (
            <div className="mb-8 rounded-sm bg-[#F7F7F7] border border-[#111111] p-6 text-center">
              <p className="text-sm font-semibold text-[#111111]">{error}</p>
              <Button variant="outline" size="sm" onClick={loadDashboardData} className="mt-3 rounded-sm">
                Retry Loading
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <ProviderStatsCard
                  title="Total Services"
                  value={stats.totalServices}
                  subtitle={`${stats.activeServices} active catalog items`}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                />

                <ProviderStatsCard
                  title="Pending Requests"
                  value={stats.pendingBookings}
                  subtitle="Awaiting your approval"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                <ProviderStatsCard
                  title="Confirmed Bookings"
                  value={stats.confirmedBookings}
                  subtitle="Accepted appointments"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                <ProviderStatsCard
                  title="Upcoming Schedule"
                  value={stats.upcomingBookingsCount}
                  subtitle="Active upcoming slots"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <Link
                  href="/provider/services"
                  className="bg-white rounded-sm border border-[#E5E5E5] p-6 hover:border-[#111111] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mb-3 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-[#111111] transition-colors">
                      My Services
                    </h3>
                    <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                      View, edit prices & durations, and manage your active service listings.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#111111] mt-4 inline-flex items-center group-hover:underline">
                    Manage Services →
                  </span>
                </Link>

                <Link
                  href="/provider/bookings"
                  className="bg-white rounded-sm border border-[#E5E5E5] p-6 hover:border-[#111111] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mb-3 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-[#111111] transition-colors">
                      Booking Requests
                    </h3>
                    <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                      Review incoming customer appointments, accept or decline requests.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#111111] mt-4 inline-flex items-center group-hover:underline">
                    Review Bookings ({stats.pendingBookings} pending) →
                  </span>
                </Link>

                <Link
                  href="/provider/schedule"
                  className="bg-white rounded-sm border border-[#E5E5E5] p-6 hover:border-[#111111] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mb-3 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-[#111111] transition-colors">
                      Work Schedule
                    </h3>
                    <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                      Track upcoming confirmed appointments sorted chronologically.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#111111] mt-4 inline-flex items-center group-hover:underline">
                    View Schedule →
                  </span>
                </Link>
              </div>

              {/* Recent Bookings Preview */}
              <div className="bg-white rounded-sm border border-[#E5E5E5] p-6">
                <div className="flex items-center justify-between mb-4 border-b border-[#E5E5E5] pb-3">
                  <h2 className="text-base font-bold text-[#111111]">Recent Customer Bookings</h2>
                  <Link href="/provider/bookings" className="text-xs font-semibold text-[#111111] hover:underline">
                    View All Bookings →
                  </Link>
                </div>

                {recentBookings.length === 0 ? (
                  <p className="text-xs text-[#666666] py-4 text-center">
                    No customer bookings received yet. Once customers book your services, they will appear here.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E5E5E5]">
                    {recentBookings.map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-[#111111]">
                            {b.service?.title || 'Service'} — <span className="font-normal text-[#666666]">{b.customer?.name || 'Customer'}</span>
                          </p>
                          <p className="text-[#666666] mt-0.5">
                            {b.bookingDate} • Ref #{b.id} • ₹{Number(b.totalPrice).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <BookingStatusBadge status={b.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
