import React from 'react';

/**
 * Reusable KPI Metric Card for Provider Dashboard.
 */
export default function ProviderStatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'indigo',
  className = '',
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`bg-white rounded-2xl border ${scheme.border} p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between ${className}`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {icon && (
        <div className={`w-12 h-12 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      )}
    </div>
  );
}
