import React from 'react';

/**
 * Reusable KPI Metric Card for Provider Dashboard.
 * Black & white design system — uses monochrome styling.
 */
export default function ProviderStatsCard({
  title,
  value,
  subtitle,
  icon,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-sm border border-[#E5E5E5] p-5 sm:p-6 hover:border-[#111111] transition-colors flex items-start justify-between ${className}`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#666666]">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-[#666666] mt-1">{subtitle}</p>}
      </div>

      {icon && (
        <div className="w-10 h-10 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
}
