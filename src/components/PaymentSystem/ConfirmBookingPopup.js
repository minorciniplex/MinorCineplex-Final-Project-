import React from 'react';

export default function ConfirmBookingPopup({ open, onClose, onConfirm, loading, error }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-[#21263F] rounded-[8px] w-[95vw] max-w-[400px] border border-[#565F7E] shadow-[0_4px_30px_4px_rgba(0,0,0,0.5)] p-6 text-white flex flex-col mx-2">
        <div className="flex justify-between items-center mb-4">
          <span className="headline-3">Confirm booking</span>
          <button onClick={onClose} className="text-white text-2xl leading-none">×</button>
        </div>
        <div className="body-1-regular text-base-gray-200 mb-6 text-center">
          Do you want to confirm booking and payment?
        </div>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <div className="flex justify-between gap-4 mt-2">
          <button
            className="w-1/2 py-2 rounded bg-base-gray-200 text-white"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="w-1/2 py-2 rounded bg-brand-blue-200 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
} 