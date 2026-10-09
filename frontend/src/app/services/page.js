'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { serviceApi } from '../../lib/serviceApi';
import ServiceCard from '../../components/services/ServiceCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-driven query state
  const urlSearch = searchParams.get('search') || '';
  const urlCategoryId = searchParams.get('categoryId') || '';
  const urlMinPrice = searchParams.get('minPrice') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlSort = searchParams.get('sort') || 'newest';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    page: urlPage,
    limit: 9,
    totalItems: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Price input state for manual entry
  const [minPriceInput, setMinPriceInput] = useState(urlMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(urlMaxPrice);

  // Track active request ID to avoid stale responses
  const activeRequestId = useRef(0);
  const searchDebounceTimer = useRef(null);

  // Keep local search input in sync if URL changes (e.g. Back/Forward button)
  useEffect(() => {
    setSearchInput(urlSearch);
    setMinPriceInput(urlMinPrice);
    setMaxPriceInput(urlMaxPrice);
  }, [urlSearch, urlMinPrice, urlMaxPrice]);

  // Load categories once on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const catList = await serviceApi.getCategories();
        if (isMounted && Array.isArray(catList)) {
          setCategories(catList);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Push new filters to URL query string.
   */
  const updateQueryParams = useCallback(
    (newParams) => {
      const params = new URLSearchParams();

      const search = newParams.search !== undefined ? newParams.search : urlSearch;
      const categoryId = newParams.categoryId !== undefined ? newParams.categoryId : urlCategoryId;
      const minPrice = newParams.minPrice !== undefined ? newParams.minPrice : urlMinPrice;
      const maxPrice = newParams.maxPrice !== undefined ? newParams.maxPrice : urlMaxPrice;
      const sort = newParams.sort !== undefined ? newParams.sort : urlSort;
      const page = newParams.page !== undefined ? newParams.page : 1;

      if (search && search.trim()) params.set('search', search.trim());
      if (categoryId) params.set('categoryId', categoryId);
      if (minPrice !== '' && !isNaN(minPrice)) params.set('minPrice', minPrice);
      if (maxPrice !== '' && !isNaN(maxPrice)) params.set('maxPrice', maxPrice);
      if (sort && sort !== 'newest') params.set('sort', sort);
      if (page && page > 1) params.set('page', page.toString());

      const queryStr = params.toString();
      const targetUrl = queryStr ? `/services?${queryStr}` : '/services';
      router.push(targetUrl);
    },
    [router, urlSearch, urlCategoryId, urlMinPrice, urlMaxPrice, urlSort]
  );

  /**
   * Fetch services matching the current URL query parameters.
   */
  const fetchServices = useCallback(async () => {
    const requestId = ++activeRequestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const data = await serviceApi.getServices({
        search: urlSearch,
        categoryId: urlCategoryId ? parseInt(urlCategoryId, 10) : undefined,
        minPrice: urlMinPrice !== '' ? parseFloat(urlMinPrice) : undefined,
        maxPrice: urlMaxPrice !== '' ? parseFloat(urlMaxPrice) : undefined,
        sort: urlSort,
        page: urlPage,
        limit: 9,
      });

      // Prevent race conditions: only update state if this is the latest request
      if (requestId === activeRequestId.current) {
        setServices(data.items || []);
        setPagination(
          data.pagination || {
            page: urlPage,
            limit: 9,
            totalItems: data.items?.length || 0,
            totalPages: 1,
          }
        );
        setIsLoading(false);
      }
    } catch (err) {
      if (requestId === activeRequestId.current) {
        setError(err.message || 'Unable to load services. Please check your connection.');
        setIsLoading(false);
      }
    }
  }, [urlSearch, urlCategoryId, urlMinPrice, urlMaxPrice, urlSort, urlPage]);

  // Refetch services whenever URL search parameters change
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /**
   * Debounced Search Input Handler (400ms debounce).
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    searchDebounceTimer.current = setTimeout(() => {
      updateQueryParams({ search: value, page: 1 });
    }, 400);
  };

  /**
   * Category Filter Handler.
   */
  const handleCategorySelect = (catId) => {
    const nextCatId = urlCategoryId === catId.toString() ? '' : catId.toString();
    updateQueryParams({ categoryId: nextCatId, page: 1 });
  };

  /**
   * Sort Change Handler.
   */
  const handleSortChange = (e) => {
    updateQueryParams({ sort: e.target.value, page: 1 });
  };

  /**
   * Price Range Apply Handler.
   */
  const handleApplyPriceFilter = (e) => {
    e.preventDefault();
    updateQueryParams({
      minPrice: minPriceInput.trim(),
      maxPrice: maxPriceInput.trim(),
      page: 1,
    });
  };

  /**
   * Clear All Filters Handler.
   */
  const handleClearFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/services');
  };

  /**
   * Page Change Handler.
   */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateQueryParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(
    urlSearch || urlCategoryId || urlMinPrice || urlMaxPrice || (urlSort && urlSort !== 'newest')
  );

  return (
    <div className="flex-1 py-8 sm:py-12 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Marketplace Header */}
        <div className="mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Explore Services
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
              Browse trusted local services, compare transparent pricing, and check real-time
              appointment availability with zero double-booking protection.
            </p>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 sm:mt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-[#666666] hover:text-[#111111]"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-sm border border-[#E5E5E5] shadow-xs p-4 sm:p-6 mb-8 space-y-5">
          {/* Top Row: Search Input & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search services by keyword (e.g. cleaning, plumbing, repair)..."
                aria-label="Search services"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-sm text-sm text-[#111111] placeholder-[#666666] focus:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:border-[#111111] hover:border-[#666666] transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateQueryParams({ search: '', page: 1 });
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Clear search text"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-select" className="text-xs font-medium text-gray-500 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={urlSort}
                onChange={handleSortChange}
                aria-label="Sort services"
                className="bg-white border border-[#E5E5E5] rounded-sm px-3 py-2.5 text-xs sm:text-sm font-medium text-[#111111] focus:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:border-[#111111] hover:border-[#666666] transition-colors cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Category
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCategorySelect('')}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  !urlCategoryId
                    ? 'bg-[#111111] text-white'
                    : 'bg-white text-[#666666] border border-[#E5E5E5] hover:border-[#1F1F1F] hover:text-[#111111]'
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => {
                const isSelected = urlCategoryId === cat.id.toString();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#111111] text-white'
                        : 'bg-white text-[#666666] border border-[#E5E5E5] hover:border-[#1F1F1F] hover:text-[#111111]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter Form */}
          <form
            onSubmit={handleApplyPriceFilter}
            className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-1">
              Price Range:
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Min ₹"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                aria-label="Minimum price"
                className="w-24 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-sm text-xs text-[#111111] focus:outline-none focus-visible:ring-1 focus-visible:ring-black hover:border-[#666666] transition-colors"
              />
              <span className="text-[#666666] text-xs">to</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Max ₹"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                aria-label="Maximum price"
                className="w-24 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-sm text-xs text-[#111111] focus:outline-none focus-visible:ring-1 focus-visible:ring-black hover:border-[#666666] transition-colors"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="text-xs font-medium py-1.5">
              Apply Price
            </Button>
            {(urlMinPrice || urlMaxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  updateQueryParams({ minPrice: '', maxPrice: '', page: 1 });
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Reset price
              </button>
            )}
          </form>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" label="Loading services catalog..." />
            <p className="mt-4 text-sm text-gray-500">Finding available services...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E5E5E5] rounded-sm p-8 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#111111]">Unable to load services</h3>
            <p className="mt-1 text-sm text-[#666666]">{error}</p>
            <div className="mt-5">
              <Button variant="outline" size="sm" onClick={fetchServices} className="rounded-sm border-[#E5E5E5]">
                Try Again
              </Button>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-sm border border-[#E5E5E5] p-12 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111111]">No services found</h3>
            <p className="mt-2 text-sm text-[#666666] leading-relaxed">
              We couldn&apos;t find any active services matching your search criteria. Try adjusting your
              filters or search terms.
            </p>
            {hasActiveFilters && (
              <div className="mt-6">
                <Button variant="primary" size="md" onClick={handleClearFilters} className="rounded-sm">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Results Counter */}
            <div className="mb-4 flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                Showing <strong className="text-gray-900">{services.length}</strong> of{' '}
                <strong className="text-gray-900">{pagination.totalItems}</strong> services
              </span>
              <span>
                Page <strong className="text-gray-900">{pagination.page}</strong> of{' '}
                <strong className="text-gray-900">{pagination.totalPages}</strong>
              </span>
            </div>

            {/* Service Cards Grid (Responsive: 1 col mobile, 2 col tablet, 3 col desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Server-Side Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  aria-label="Previous page"
                >
                  ← Previous
                </Button>

                <div className="text-xs text-gray-600 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  aria-label="Next page"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" label="Loading marketplace..." />
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
