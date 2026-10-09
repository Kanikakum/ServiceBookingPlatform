'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { providerApi } from '../../../lib/providerApi';
import { ROUTES } from '../../../utils/routes';
import AuthGuard from '../../../components/auth/AuthGuard';
import DeactivateServiceModal from '../../../components/provider/DeactivateServiceModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Button from '../../../components/common/Button';

export default function ProviderServicesPage() {
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deactivation modal state
  const [deactivateModalService, setDeactivateModalService] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Fetch services owned by the authenticated provider.
   */
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await providerApi.getProviderServices({ page, limit: 10 });
      setServices(data.items || []);
      setPagination(
        data.pagination || {
          page,
          limit: 10,
          totalItems: data.items?.length || 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err.message || 'Unable to load your services.');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /**
   * Execute soft-deletion / deactivation.
   */
  const handleConfirmDeactivate = async () => {
    if (!deactivateModalService) return;

    setIsDeactivating(true);
    setDeactivateError(null);

    try {
      await providerApi.deactivateService(deactivateModalService.id);
      setSuccessMessage(`Service "${deactivateModalService.title}" was deactivated successfully.`);
      setDeactivateModalService(null);
      await fetchServices();
    } catch (err) {
      setDeactivateError(err.message || 'Failed to deactivate service.');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['PROVIDER']}>
      <div className="flex-1 py-10 bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Add Action */}
          <div className="mb-8 sm:flex sm:items-center sm:justify-between border-b border-[#E5E5E5] pb-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Link
                  href={ROUTES.PROVIDER_DASHBOARD}
                  className="text-xs font-semibold text-[#666666] hover:text-[#111111]"
                >
                  ← Provider Dashboard
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                My Service Listings
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] mt-1">
                Create and manage your professional service catalog, adjust pricing, and control active status.
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <Link href="/provider/services/new">
                <Button variant="primary" size="md" className="font-semibold rounded-sm">
                  + Add New Service
                </Button>
              </Link>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 rounded-sm bg-[#F7F7F7] border border-[#111111] p-4 text-xs sm:text-sm text-[#111111] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#111111] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-[#666666] hover:text-[#111111]"
              >
                ✕
              </button>
            </div>
          )}

          {/* Content Views */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <LoadingSpinner size="lg" label="Loading provider services..." />
              <p className="mt-3 text-sm text-[#666666] font-medium">Fetching your service catalog...</p>
            </div>
          ) : error ? (
            <div className="bg-[#F7F7F7] border border-[#111111] rounded-sm p-8 text-center max-w-lg mx-auto">
              <h3 className="text-base font-bold text-[#111111]">Error Loading Services</h3>
              <p className="mt-1 text-sm text-[#666666]">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchServices} className="mt-4 rounded-sm">
                Try Again
              </Button>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#E5E5E5] p-12 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#111111]">You haven&apos;t created any services yet</h2>
              <p className="mt-2 text-sm text-[#666666] leading-relaxed">
                Add your first service listing with title, category, price, and duration to start receiving customer bookings.
              </p>
              <div className="mt-6">
                <Link href="/provider/services/new">
                  <Button variant="primary" size="md" className="rounded-sm">
                    + Create First Service
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Services List / Table */}
              <div className="bg-white rounded-sm border border-[#E5E5E5] overflow-hidden">
                <div className="divide-y divide-[#E5E5E5]">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-5 sm:p-6 hover:bg-[#F7F7F7] transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      {/* Left: Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold border ${
                              service.isActive
                                ? 'bg-[#111111] text-white border-[#111111]'
                                : 'bg-[#F7F7F7] text-[#666666] border-[#E5E5E5]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                service.isActive ? 'bg-white' : 'bg-[#666666]'
                              }`}
                            />
                            {service.isActive ? 'Active' : 'Deactivated'}
                          </span>

                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5]">
                            {service.category?.name || 'Category'}
                          </span>

                          <span className="text-xs text-[#666666]">•</span>
                          <span className="text-xs text-[#666666] font-mono">ID #{service.id}</span>
                        </div>

                        <h3 className="text-lg font-bold text-[#111111]">
                          {service.title}
                        </h3>

                        <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#666666] pt-1">
                          <span>
                            Price: <strong className="text-[#111111] font-bold">₹{Number(service.price).toLocaleString('en-IN')}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Duration: <strong className="text-[#111111] font-semibold">{service.durationMinutes} min</strong>
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E5E5] justify-end">
                        <Link href={`/services/${service.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs font-medium text-[#666666] hover:text-[#111111] rounded-sm">
                            View Public
                          </Button>
                        </Link>

                        <Link href={`/provider/services/${service.id}/edit`}>
                          <Button variant="outline" size="sm" className="text-xs font-semibold rounded-sm border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F7]">
                            Edit Service
                          </Button>
                        </Link>

                        {service.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeactivateModalService(service);
                              setDeactivateError(null);
                            }}
                            className="text-xs font-medium rounded-sm border-[#E5E5E5] text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]"
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-[#E5E5E5] pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-sm border-[#E5E5E5]"
                  >
                    ← Previous
                  </Button>
                  <span className="text-xs font-medium text-[#666666]">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-sm border-[#E5E5E5]"
                  >
                    Next →
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Deactivation Modal */}
          {deactivateModalService && (
            <DeactivateServiceModal
              service={deactivateModalService}
              onClose={() => setDeactivateModalService(null)}
              onConfirm={handleConfirmDeactivate}
              isDeactivating={isDeactivating}
              error={deactivateError}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
