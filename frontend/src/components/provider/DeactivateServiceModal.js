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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">Deactivate Service?</h3>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            Are you sure you want to deactivate <strong className="text-gray-900 font-semibold">{service.title}</strong>?
            Customers will no longer be able to discover or book this service. Historical bookings will remain intact.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            disabled={isDeactivating}
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            isLoading={isDeactivating}
            disabled={isDeactivating}
            onClick={onConfirm}
            className="flex-1"
          >
            Yes, Deactivate
          </Button>
        </div>
      </div>
    </div>
  );
}
