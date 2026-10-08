'use client';

import React from 'react';
import Link from 'next/link';
import AuthGuard from '../../../../components/auth/AuthGuard';
import ServiceForm from '../../../../components/provider/ServiceForm';

export default function NewServicePage() {
  return (
    <AuthGuard allowedRoles={['PROVIDER']}>
      <div className="flex-1 py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/provider/services"
              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
            >
              ← Back to Service Listings
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Create New Service Listing
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Add a new service offering with title, category, description, price, and estimated duration.
            </p>
          </div>

          <ServiceForm isEdit={false} />
        </div>
      </div>
    </AuthGuard>
  );
}
