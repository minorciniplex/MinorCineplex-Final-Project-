import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function CouponSelectPopup({ open, coupons, onClose, onApply }) {
  const [selected, setSelected] = useState(null);
  const [activeCouponId, setActiveCouponId] = useState(null);
  const router = useRouter();
  
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-[#181F36] rounded-xl w-[360px] md:w-[600px] p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="headline-4 text-white">Select coupon</span>
          <button onClick={onClose} className="text-white text-xl hover:text-base-gray-300 transition-colors">×</button>
        </div>
        <div className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto">
          {coupons.length === 0 && (
            <div className="text-base-gray-300 text-center py-8">No coupons</div>
          )}
          {coupons.map(coupon => (
            <div
              key={coupon.id}
              className={`rounded flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-[#2A3349] ${activeCouponId === coupon.coupons.coupon_id ? 'border-2 border-white bg-[#353B4A]' : 'border border-transparent bg-[#232B47] hover:bg-[#2A3349]'}`}
              onClick={() => {
                setActiveCouponId(coupon.coupons.coupon_id);
                setSelected(coupon);
              }}
            >
              <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] bg-base-gray-100 rounded flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                {coupon.coupons.image ? (
                  <Image 
                    src={coupon.coupons.image} 
                    alt={coupon.coupons.title} 
                    width={80} 
                    height={80} 
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/default-coupon.png';
                    }}
                  />
                ) : (
                  <span>{coupon.coupons.title.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm md:text-base truncate">{coupon.coupons.title}</div>
                <div className="text-xs md:text-sm text-base-gray-300">Valid until {formatDate(coupon.coupons.end_date)}</div>
                <button className="text-brand-blue-100 hover:text-brand-blue-200 underline text-xs md:text-sm mt-1 transition-colors"
                onClick={() => router.push(`/coupons/viewcoupon/${coupon.coupons.coupon_id}`)}
                >View details</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button 
            onClick={onClose} 
            className="w-1/2 py-2 md:py-3 rounded bg-base-gray-100 text-white hover:bg-base-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => selected && onApply(selected.coupons.coupon_id)}
            className={`w-1/2 py-2 md:py-3 rounded transition-colors ${
              selected 
                ? 'bg-brand-blue-100 text-white hover:bg-brand-blue-200' 
                : 'bg-base-gray-300 text-base-gray-400 cursor-not-allowed'
            }`}
            disabled={!selected}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
} 