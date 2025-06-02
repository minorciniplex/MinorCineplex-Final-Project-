import React, { useState, useRef } from "react";
import SumPaymentDiscount from './Components/SumPaymentDiscount';
import CouponDiscount from './Components/CouponDiscount';
import CouponSelectPopup from './Components/CouponSelectPopup';
import useCouponWallet from '@/hooks/useCouponWallet';
import { useStatus } from "@/context/StatusContext";

export default function CouponPaymentCard({ showtimes, bookingId, bookingSeats, paymentMethod }) {
  const [openCouponPopup, setOpenCouponPopup] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const { user } = useStatus();
  const { couponsInWallet, loading: loadingCoupons } = useCouponWallet(user);
  const selectedCoupon = couponsInWallet.find(c => c.coupons.coupon_id === selectedCouponId);
  console.log(selectedCouponId);


  return (
    <div className="w-full rounded-lg ">
      <div className="mb-4">
        <CouponDiscount 
          coupon={selectedCoupon?.coupons?.title || "Not Found Coupon"}
          onRemove={() => setSelectedCouponId(null)}
          onSelectCoupon={() => setOpenCouponPopup(true)}
        />
      </div>
      
      <div className="w-full rounded-lg ">
        <SumPaymentDiscount
          coupon={selectedCoupon}
          showtimes={showtimes}
          bookingId={bookingId}
          couponId={selectedCouponId}
          bookingSeats={bookingSeats}
          paymentMethod={paymentMethod}
        />
      </div>
      <CouponSelectPopup
        open={openCouponPopup}
        coupons={couponsInWallet}
        onClose={() => setOpenCouponPopup(false)}
        onApply={couponId => {
          setSelectedCouponId(couponId);
          setOpenCouponPopup(false);
        }}
      />
    </div>
  );
} 