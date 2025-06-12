import React from "react";
import { useRouter } from "next/router";
import CouponsCard from "@/components/Coupons-components/CouponsCard";
import useCouponWallet from "@/hooks/useCouponWallet";

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
      <div className="flex flex-col">
        <div className="p-4 pt-10 md:pt-0 md:ml-8">
          <h1 className="text-4xl font-bold mb-6">My coupons</h1>
          <div className="w-fit grid grid-cols-2 md:grid-cols-2 gap-6">
            {couponsInWallet.map((coupon) => (
              <div key={coupon.coupon_id}>
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
      </div>
    </>
  );
};

export default MyCoupon;
