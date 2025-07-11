import React from "react";
import { useRouter } from "next/router";
import CouponsCard from "@/components/Coupons-components/CouponsCard";
import useCouponWallet from "@/hooks/useCouponWallet";

const MyCoupon = () => {
  const router = useRouter();
  const { couponsInWallet, loading, error } = useCouponWallet();


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>An error occurred: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full md:w-max px-4 md:px-0 ">
        <h1 className="text-2xl md:text-2xl font-bold mb-4 md:mb-6">
          My coupons
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
          {couponsInWallet.map((coupon) => (
            <div key={coupon.coupon_id} className="relative ">
              <CouponsCard
                coupon_id={coupon.coupon_id}
                image={coupon.coupons.image}
                title={coupon.coupons.title}
                end_date={coupon.coupons.end_date}
              />
            </div>
          ))}
        </div>
        {couponsInWallet.length === 0 && (
          <div className="text-center text-gray-500 mt-6 md:mt-8">
            <p>You don&apos;t have any coupons in your wallet yet</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MyCoupon;
