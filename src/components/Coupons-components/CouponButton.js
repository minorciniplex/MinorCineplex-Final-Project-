import { useRouter } from 'next/navigation';

function CouponButton({ isClaimed, isLoggedIn, couponId, handleClaimCoupon, isDetailPage }) {
  const router = useRouter();

  return (
    isClaimed ? (
      <button
        className="w-full h-[36px] sm:h-[40px] md:w-[full] md:h-[48px] rounded-[4px] px-0 font-medium text-sm sm:text-base bg-gray-300 text-gray-500 shadow-md mt-2 md:mt-3"
        onClick={() => !isDetailPage && router.push(`/coupons/viewcoupon/${couponId}`)}
        disabled={isDetailPage}
      >
        {isDetailPage ? 'coupon saved' : 'View Detail'}
      </button>
    ) : (
      <button
        className="w-full h-[36px] sm:h-[40px] md:w-[237px] md:h-[48px] rounded-[4px] px-0 font-medium text-sm sm:text-base bg-brand-blue-100 text-white hover:bg-brand-blue-200 transition-colors duration-200 shadow-md mt-2 md:mt-3"
        onClick={() => isLoggedIn ? handleClaimCoupon() : router.push('/auth/login')}
      >
        Get Coupon
      </button>
    )
  );
}

export default CouponButton; 