import React, { useState } from 'react';

export default function CouponSelectPopup({ open, coupons = [], onClose, onApply }) {
  const [selected, setSelected] = useState(null);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-[#181F36] rounded-xl w-[360px] p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="headline-4 text-white">Select coupon</span>
          <button onClick={onClose} className="text-white text-xl">×</button>
        </div>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {coupons.length === 0 && (
            <div className="text-base-gray-300 text-center py-8">No coupons</div>
          )}
          {coupons.map(coupon => (
            <div
              key={coupon.id}
              className={`rounded flex items-center gap-3 p-3 cursor-pointer border ${selected?.id === coupon.id ? 'border-white bg-[#232B47]' : 'border-transparent bg-[#232B47]'}`}
              onClick={() => setSelected(coupon)}
            >
              {/* ตัวอย่าง: ใส่รูปภาพคูปอง ถ้ามี coupon.image_url */}
              <div className="w-[60px] h-[60px] bg-base-gray-100 rounded flex items-center justify-center text-white text-2xl font-bold">
                {coupon.discount ? `${coupon.discount}%` : 'Coupon'}
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm truncate">{coupon.description}</div>
                <div className="text-xs text-base-gray-300">Valid until {coupon.expired_at}</div>
                <button className="text-brand-blue-100 underline text-xs mt-1">View details</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="w-1/2 py-2 rounded bg-base-gray-100 text-white">Back</button>
          <button
            onClick={() => selected && onApply(selected)}
            className={`w-1/2 py-2 rounded ${selected ? 'bg-brand-blue-100 text-white' : 'bg-base-gray-300 text-base-gray-400 cursor-not-allowed'}`}
            disabled={!selected}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
} 