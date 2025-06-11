import React, { useState, useMemo } from 'react';
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
  
  // กรองคูปองที่ยังไม่หมดอายุ
  const validCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter(coupon => {
      const endDate = new Date(coupon.coupons.end_date);
      return endDate > now;
    });
  }, [coupons]);
  
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-[#181F36] rounded-xl sm:w-[360px] sm:h-[500px] md:w-[600px] lg:w-[1000px] lg:h-[600px] p-4 overflow-y-auto h-full hide-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <span className="headline-4 text-white">Select coupon</span>
          <button onClick={onClose} className="text-white text-xl hover:text-base-gray-300 transition-colors">×</button>
        </div>
        <div className="space-y-3 max-h-[300px] bg-base-gray-100 md:max-h-[400px] overflow-y-auto">
          {validCoupons.length === 0 && (
            <div className="text-base-gray-300 text-center py-8">No valid coupons available</div>
          )}
          <div className="lg:grid lg:grid-cols-2 gap-4">
          {validCoupons.map(coupon => (
            <div key={coupon.coupons.coupon_id} className="flex flex-col gap-4">
            <div
              className={` lg:w-[464px] lg:h-[174px] lg:grid lg:grid-cols-2 sm:mb-[5px]
                 rounded flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-[#2A3349] ${activeCouponId === coupon.coupons.coupon_id ? 'border-2 border-white bg-[#353B4A]' : 'border border-transparent bg-[#232B47] hover:bg-[#2A3349]'}`}
              onClick={() => {
                setActiveCouponId(coupon.coupons.coupon_id);
                setSelected(coupon);
              }}
            >
              <div className="lg:w-[174px] lg:h-full sm:w-[100px] sm:h-[100px] md:w-[100px] md:h-[100px] 
    bg-base-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-md 
    aspect-square">
                {coupon.coupons.image ? (
                  <Image 
                    src={coupon.coupons.image} 
                    alt={coupon.coupons.title} 
                    width={174} 
                    height={174} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/assets/images/default-coupon.png';
                    }}
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">t</span>
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
            </div>
          ))}
        </div>
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