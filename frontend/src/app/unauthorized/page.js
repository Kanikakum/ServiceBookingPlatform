'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, getDefaultDashboardRoute } from '../../utils/routes';
import Button from '../../components/common/Button';

export default function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuth();
  const targetDashboard = user ? getDefaultDashboardRoute(user.role) : ROUTES.LOGIN;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Access Restricted</h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          You do not have permission to view this page. This section requires different account privileges.
        </p>

        {isAuthenticated && user && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            Logged in as <span className="font-semibold text-gray-900">{user.email}</span> ({user.role})
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={targetDashboard} className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              {isAuthenticated ? 'Go to My Dashboard' : 'Sign In with Another Account'}
            </Button>
          </Link>
          <Link href={ROUTES.HOME} className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
