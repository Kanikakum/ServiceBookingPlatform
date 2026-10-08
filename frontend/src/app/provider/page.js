'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthGuard from '../../components/auth/AuthGuard';
import Button from '../../components/common/Button';

export default function ProviderDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard allowedRoles={['PROVIDER']}>
      <div className="flex-1 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                    Service Provider Account
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

          {/* Provider Management Notice */}
          <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-8 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Provider Service Hub</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
              You are securely authenticated as a Service Provider! The interactive service management UI,
              price & duration editor, and real-time booking request manager (accept/reject) will be integrated
              in subsequent phases.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-violet-700">
              <span className="bg-white px-3 py-1.5 rounded-lg border border-violet-100 shadow-2xs font-medium">
                ✓ Service CRUD Management
              </span>
              <span className="bg-white px-3 py-1.5 rounded-lg border border-violet-100 shadow-2xs font-medium">
                ✓ Category Assignment
              </span>
              <span className="bg-white px-3 py-1.5 rounded-lg border border-violet-100 shadow-2xs font-medium">
                ✓ Booking Accept / Reject Workflow
              </span>
              <span className="bg-white px-3 py-1.5 rounded-lg border border-violet-100 shadow-2xs font-medium">
                ✓ Concurrency Lock Protected Schedule
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
