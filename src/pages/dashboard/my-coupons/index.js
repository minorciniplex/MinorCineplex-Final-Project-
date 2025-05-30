import React from "react";
import { useRouter } from "next/router";
import CouponsCard from "@/components/Coupons-components/CouponsCard";
import useCouponWallet from '@/hooks/useCouponWallet';

const MyCoupon = () => {
  const router = useRouter();
  const { couponsInWallet, loading, error } = useCouponWallet();
  console.log(couponsInWallet);


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
        <p>เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="lg:w-[789px] sm:w-[380px] " >
        <h1 className="text-2xl font-bold mb-6">My coupons</h1>
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-22 gap-4">
          {couponsInWallet.map((coupon) => (
            <div key={coupon.coupon_id} className="relative">
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
          <div className="text-center text-gray-500 mt-8">
            <p>คุณยังไม่มีคูปองในกระเป๋า</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MyCoupon;
