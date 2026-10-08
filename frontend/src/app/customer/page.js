'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthGuard from '../../components/auth/AuthGuard';
import Button from '../../components/common/Button';

export default function CustomerDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard allowedRoles={['CUSTOMER']}>
      <div className="flex-1 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Customer Account
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">ID #{user?.id}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Signed in as <span className="font-medium text-gray-900">{user?.email}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>

          {/* Marketplace Discovery Banner */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-8 sm:p-10 text-center shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-200">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Explore Local Service Marketplace</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
              Find top-rated home cleaning, plumbing, repairs, and tutoring with transparent pricing and instant
              booking capability.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.assign('/services')}
                className="px-6 py-2.5 font-semibold"
              >
                Browse All Services →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
