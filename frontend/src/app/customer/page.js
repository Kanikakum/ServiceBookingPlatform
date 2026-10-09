'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import AuthGuard from '../../components/auth/AuthGuard';
import Button from '../../components/common/Button';
import { ROUTES } from '../../utils/routes';

export default function CustomerDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard allowedRoles={['CUSTOMER']}>
      <div className="flex-1 py-10 bg-[#F7F7F7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-sm border border-[#E5E5E5] p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5]">
                    Customer Account
                  </span>
                  <span className="text-xs text-[#666666]">•</span>
                  <span className="text-xs text-[#666666]">ID #{user?.id}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-sm text-[#666666] mt-1">
                  Signed in as <span className="font-medium text-[#111111]">{user?.email}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="rounded-sm text-[#111111] border-[#E5E5E5] hover:bg-[#F7F7F7]"
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Action 1: Browse Services */}
            <div className="bg-white rounded-sm border border-[#E5E5E5] p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-sm bg-[#111111] text-white flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#111111]">Explore Services</h2>
                <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                  Discover verified service providers with upfront pricing, live calendar slot checking, and instant booking locks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
                <Link href={ROUTES.SERVICES}>
                  <Button variant="primary" size="md" className="w-full rounded-sm font-semibold">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </div>

            {/* Action 2: My Bookings */}
            <div className="bg-white rounded-sm border border-[#E5E5E5] p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-sm bg-[#111111] text-white flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#111111]">My Bookings</h2>
                <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                  View your scheduled appointments, inspect booking statuses, see confirmed time slots, and manage cancellations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
                <Link href={ROUTES.CUSTOMER_BOOKINGS}>
                  <Button variant="outline" size="md" className="w-full rounded-sm font-semibold bg-white">
                    View Appointments
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
