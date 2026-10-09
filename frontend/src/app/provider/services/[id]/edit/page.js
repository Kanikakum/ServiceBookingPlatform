'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { providerApi } from '../../../../../lib/providerApi';
import AuthGuard from '../../../../../components/auth/AuthGuard';
import ServiceForm from '../../../../../components/provider/ServiceForm';
import LoadingSpinner from '../../../../../components/common/LoadingSpinner';
import Button from '../../../../../components/common/Button';

function EditServiceContent({ params }) {
  const resolvedParams = use(params);
  const serviceId = resolvedParams.id;

  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchService = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await providerApi.getServiceById(serviceId);
        if (isMounted) {
          setService(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.status === 404 ? 'Service not found or you do not own this service' : err.message);
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
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" label="Loading service details..." />
        <p className="mt-3 text-xs text-gray-500 font-medium">Fetching service information for editing...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="py-16 text-center max-w-md mx-auto bg-white p-8 rounded-sm border border-[#E5E5E5]">
        <h2 className="text-lg font-bold text-[#111111]">Service Not Available</h2>
        <p className="text-xs text-[#666666] mt-1">{error || 'Unable to load service for editing.'}</p>
        <div className="mt-6">
          <Link href="/provider/services">
            <Button variant="primary" size="md" className="rounded-sm">
              ← Return to Services
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/provider/services"
          className="inline-flex items-center text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors mb-2"
        >
          ← Back to Service Listings
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Edit Service Listing
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-1">
          Update service information, adjust pricing, or change duration for{' '}
          <strong className="text-[#111111] font-semibold">{service.title}</strong>.
        </p>
      </div>

      <ServiceForm initialData={service} isEdit={true} />
    </div>
  );
}

export default function EditServicePage(props) {
  return (
    <AuthGuard allowedRoles={['PROVIDER']}>
      <div className="flex-1 py-10 bg-[#F7F7F7]">
        <Suspense
          fallback={
            <div className="py-24 flex flex-col items-center justify-center">
              <LoadingSpinner size="lg" label="Loading..." />
            </div>
          }
        >
          <EditServiceContent {...props} />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
