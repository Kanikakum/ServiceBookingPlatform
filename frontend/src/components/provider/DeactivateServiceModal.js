import React from 'react';
import Button from '../common/Button';

export default function DeactivateServiceModal({
  service,
  onClose,
  onConfirm,
  isDeactivating = false,
  error = null,
}) {
  if (!service) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-modal-title"
    >
      <div className="bg-white rounded-sm max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E5E5E5] space-y-5">
        <div className="w-12 h-12 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <div className="text-center">
          <h3 id="deactivate-modal-title" className="text-lg font-bold text-[#111111]">
            Deactivate Service?
          </h3>
          <p className="mt-2 text-sm text-[#666666] leading-relaxed">
            Are you sure you want to deactivate{' '}
            <strong className="text-[#111111] font-semibold">{service.title}</strong>?
            Customers will no longer be able to discover or book this service. Historical bookings will remain intact.
          </p>
        </div>

        {error && (
          <div className="rounded-sm bg-[#F7F7F7] border border-[#111111] p-3 text-sm text-[#111111]">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            size="md"
            disabled={isDeactivating}
            onClick={onClose}
            className="flex-1 rounded-sm border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F7]"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isDeactivating}
            disabled={isDeactivating}
            onClick={onConfirm}
            className="flex-1 rounded-sm bg-[#111111] text-white hover:bg-black"
          >
            Yes, Deactivate
          </Button>
        </div>
      </div>
    </div>
  );
}
