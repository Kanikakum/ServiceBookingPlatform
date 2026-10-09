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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-[#F7F7F7]">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-sm border border-[#E5E5E5]">
        <div className="w-16 h-16 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Access Restricted</h1>
        <p className="mt-2 text-sm text-[#666666] leading-relaxed">
          You do not have permission to view this page. This section requires different account privileges.
        </p>

        {isAuthenticated && user && (
          <div className="mt-4 p-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-sm text-xs text-[#666666]">
            Logged in as <span className="font-semibold text-[#111111]">{user.email}</span> ({user.role})
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={targetDashboard} className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full sm:w-auto rounded-sm">
              {isAuthenticated ? 'Go to My Dashboard' : 'Sign In with Another Account'}
            </Button>
          </Link>
          <Link href={ROUTES.HOME} className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto rounded-sm border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F7]">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
