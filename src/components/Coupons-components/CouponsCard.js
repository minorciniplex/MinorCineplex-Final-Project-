import { useRouter } from 'next/navigation';
import { useStatus } from '@/context/StatusContext';
import { useCouponClaim } from '@/hooks/useCouponClaim';
import { Loading } from '../ui/loading';
import CouponButton from './CouponButton';
import CouponAlert from './CouponAlert';
import { useState } from 'react';

function CouponsCard({ coupon_id, image, title, end_date }) {
  const router = useRouter();
  const { isLoggedIn, loading } = useStatus();
  const { isClaimed, isLoading, handleClaimCoupon, alertOpen, setAlertOpen } = useCouponClaim(coupon_id);
  
  console.log(alertOpen)
  if (loading || isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-xs sm:max-w-sm md:w-[285px] md:h-[477px] sm:h-[337px] sm:w-[180px] bg-[#070C1B] flex flex-col items-start justify-between rounded-[8px] shadow-lg overflow-hidden mx-auto p-0 ">
      
      
      <img
        className="
          w-full
          h-[160px]         
          sm:h-[285px]      
          object-cover
          bg-center
          transition-transform duration-300 group-hover:scale-105 cursor-pointer
        "
        src={image}
        alt={title}
        onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}
      />
      <div className="flex flex-col flex-1 w-full px-3 pt-3 pb-2 md:px-4 md:pt-4">
        <button onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)} className="text-start">
          <h2 className="font-bold text-base md:text-xl mb-2 line-clamp-2 hover:underline text-white">
            {title}
          </h2>
        </button>
        <div className="mb-3 md:mb-4 mt-auto">
          <p className="text-xs md:text-sm text-[#A0AEC0]">Valid until: {end_date}</p>
        </div>
        <div className="w-full flex justify-center mt-auto">
          <CouponButton
            isClaimed={isClaimed}
            isLoggedIn={isLoggedIn}
            couponId={coupon_id}
            handleClaimCoupon={handleClaimCoupon}
            setAlertOpen={setAlertOpen}
          />
        </div>
      </div>
      <CouponAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}

export default CouponsCard;

