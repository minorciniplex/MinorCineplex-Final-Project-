import { useRouter } from 'next/navigation';
import { useStatus } from '@/context/StatusContext';
import { useCouponClaim } from '@/hooks/useCouponClaim';
import { Loading } from '../ui/loading';
import CouponButton from './CouponButton';
import CouponAlert from './CouponAlert';
import { useState } from 'react';
import Image from 'next/image';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

function CouponsCard({ coupon_id, image, title, end_date }) {
  const router = useRouter();
  const { isLoggedIn, loading } = useStatus();
  const { isClaimed, isLoading, handleClaimCoupon, alertOpen, setAlertOpen } = useCouponClaim(coupon_id);
  
  console.log(alertOpen)
  if (loading || isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full bg-[#070C1B] flex flex-col items-start justify-center rounded-[8px] shadow-md overflow-hidden group cursor-pointer">
      <div
        className="w-full h-[160px] md:w-[285px] md:h-[285px] bg-cover bg-center transition-transform duration-300 group-hover:scale-105 flex items-center justify-center"
        onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            width={285}
            height={160}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-base-gray-100">No Image</div>
        )}
      </div>
      <div className="flex flex-col items-start justify-between pt-3 pb-4 px-4 md:pt-4 md:pb-6 md:px-6 w-full bg-basegray-0 flex-1">
        <div className="flex flex-col gap-2 w-full flex-1">
          <h3 className="text-basewhite font-bold text-left text-sm md:headline-4 group-hover:text-brandblue-100 transition-colors duration-200 max-w-full line-clamp-2">
            {truncateText(title, 70)}
          </h3>
          <div className="flex items-center gap-2 w-full text-xs md:text-base">
            <span className="text-base-gray-300 md:body-2-regular whitespace-nowrap">
              Valid until
            </span>
            <span className="text-base-gray-400 md:body-2-medium flex-1 truncate">
              {formatDate(end_date)}
            </span>
          </div>
        </div>
        <div className="w-full mt-3">
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

