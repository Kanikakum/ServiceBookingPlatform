'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/routes';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * AuthGuard protects routes requiring authentication and specific role authorization.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Array<string>} [props.allowedRoles] - Optional list of allowed roles e.g. ['CUSTOMER'] or ['PROVIDER']
 */
export default function AuthGuard({ children, allowedRoles = null }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!user || !allowedRoles.includes(user.role)) {
        router.replace(ROUTES.UNAUTHORIZED);
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  // While checking auth status on initial load, show loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <LoadingSpinner size="lg" label="Checking authorization..." />
        <p className="mt-4 text-sm text-gray-500 font-medium">Verifying your session...</p>
      </div>
    );
  }

  // If not authenticated, render nothing while redirect occurs
  if (!isAuthenticated) {
    return null;
  }

  // If role does not match, render nothing while redirect occurs
  if (allowedRoles && allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
