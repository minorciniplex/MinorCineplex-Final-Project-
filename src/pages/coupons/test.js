import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import CouponCardStyle2 from "@/components/Coupons-components/CouponCardStyle2";
const MyCoupon = () => {
  const router = useRouter();
  const [couponsInWallet, setCouponsInWallet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(
        "/api/dashboard/get-all-from-user-coupon"
      );
      setCouponsInWallet(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

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
        <p>Error occurred: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Coupons</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {couponsInWallet.map((coupon) => (
            <div key={coupon.coupon_id} className="relative">
              <CouponCardStyle2
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
            <p>You don&apos;t have any coupons in your wallet yet</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MyCoupon;
