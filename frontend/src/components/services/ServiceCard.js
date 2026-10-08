import React from 'react';
import Link from 'next/link';

/**
 * Format duration in minutes into a human-friendly string (e.g., "1 hr 30 min" or "45 min").
 */
const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return 'N/A';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr ${remainingMinutes} min`;
};

/**
 * Format numeric price with currency symbol.
 */
const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

export default function ServiceCard({ service }) {
  if (!service) return null;

  return (
    <div className="flex flex-col justify-between bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 p-6 group">
      <div>
        {/* Category & Duration Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {service.category?.name || 'General Service'}
          </span>
          <span className="inline-flex items-center text-xs text-gray-500 font-medium">
            <svg
              className="w-3.5 h-3.5 mr-1 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatDuration(service.durationMinutes)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          <Link href={`/services/${service.id}`}>{service.title}</Link>
        </h3>

        {/* Provider Name */}
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <svg
            className="w-3.5 h-3.5 mr-1 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Provided by <span className="font-medium text-gray-700 ml-1">{service.provider?.name || 'Verified Provider'}</span>
        </p>

        {/* Description Excerpt */}
        <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {service.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer: Price & CTA */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
            Price
          </span>
          <span className="text-xl font-extrabold text-gray-900">
            {formatPrice(service.price)}
          </span>
        </div>

        <Link
          href={`/services/${service.id}`}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all duration-150 shadow-2xs group-hover:shadow"
        >
          View Details
          <svg
            className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
