import { useRouter } from 'next/navigation';
import { useStatus } from '@/context/StatusContext';
import { useCouponClaim } from '@/hooks/useCouponClaim';
import { Loading } from '../ui/loading';

function CouponsCard({ coupon_id, image, title, end_date }) {
  const router = useRouter();
  const { isLoggedIn, loading } = useStatus();
  const { isClaimed, isLoading, handleClaimCoupon } = useCouponClaim(coupon_id);
  console.log(isClaimed)
  if (loading || isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <img
        className="w-[285px] h-[285px] object-cover rounded-md cursor-pointer"
        src={image}
        alt={title}
        onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}
      />

      <button onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}>
        <h2 className="text-start font-bold text-xl mb-2 line-clamp-2 hover:underline">
          {title}
        </h2>
      </button>

      <div>
        <p>วันที่หมดอายุ: {end_date}</p>
      </div>

      {!isClaimed ? (
        <button
          className="bg-brand-blue-100 text-white px-4 py-2 rounded-md hover:bg-[#070C1B] transition-colors duration-200"
          onClick={() => isLoggedIn ? handleClaimCoupon() : router.push('/auth/login')}
        >
          รับคูปอง
        </button>
      ) : (
        <button
          className="bg-gray-300 text-white px-4 py-2 rounded-md cursor-default"
          onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}
        >
          view detail 
        </button>
      )}
    </div>
  );
}

export default CouponsCard;

