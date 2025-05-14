import { useRouter } from 'next/navigation';

function CouponButton({ isClaimed, isLoggedIn, couponId, handleClaimCoupon }) {
  const router = useRouter();

  if (!isClaimed) {
    return (
      <button
        className="bg-brand-blue-100 text-white px-4 py-2 rounded-md hover:bg-[#070C1B] transition-colors duration-200"
        onClick={() => isLoggedIn ? handleClaimCoupon() : router.push('/auth/login')}
      >
        รับคูปอง
      </button>
    );
  }

  return (
    <button
      className="bg-gray-300 text-white px-4 py-2 rounded-md cursor-default"
      onClick={() => router.push(`/coupons/viewcoupon/${couponId}`)}
    >
      view detail
    </button>
  );
}

export default CouponButton; 