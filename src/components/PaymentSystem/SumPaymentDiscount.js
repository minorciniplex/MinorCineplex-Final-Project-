import Button from '../Button';
import { useTestBooking } from '@/hooks/testBooking';
import { useCoupon } from '@/hooks/useCoupon';
import { useState, useEffect } from 'react';
import CouponAlert from '../Coupons-components/CouponAlert';

export default function SumPaymentDiscount({ coupon, onNext, disabled }) {
  const { data, loading: bookingLoading, error: bookingError } = useTestBooking();
  const { loading: couponLoading, error: couponError, discountAmount, checkCoupon, applyCoupon } = useCoupon();
  const [checkResult, setCheckResult] = useState(null);
  const [showBookingError, setShowBookingError] = useState(false);
  const [showCouponError, setShowCouponError] = useState(false);

  useEffect(() => {
    if (bookingError) {
      setShowBookingError(true);
    }
  }, [bookingError]);

  useEffect(() => {
    if (couponError) {
      setShowCouponError(true);
    }
  }, [couponError]);

  useEffect(() => {
    const checkCouponValidity = async () => {
      if (!coupon?.coupons?.coupon_id || !data?.booking?.booking_id) {
        return;
      }
      
      try {
        const result = await checkCoupon(data.booking.booking_id, coupon.coupons.coupon_id);
        setCheckResult(result);
      } catch (error) {
        setCheckResult(null);
      }
    };

    checkCouponValidity();
  }, [coupon, data?.booking?.booking_id]);

  const handleNext = async () => {
    if (!checkResult || !data?.booking?.booking_id) {
      onNext();
      return;
    }
    
    try {
      if (checkResult.discount_amount > 0) {
        await applyCoupon(data.booking.booking_id, coupon.coupons.coupon_id, checkResult.discount_amount);
      }
      onNext();
    } catch (error) {
      onNext();
    }
  };

  if (bookingLoading || couponLoading) {
    return <div>กำลังโหลด...</div>;
  }

  const finalTotal = data?.booking?.total_price - (discountAmount || 0);

  return (
    <div className="bg-[#070C1B] w-screen max-w-none -mx-4 px-[16px] min-h-[228px] pt-4 pb-6 flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-base-gray-400 body-2-regular">Booking price</span>
          <span className="text-white body-1-medium">{data?.booking?.total_price || 0} บาท</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base-gray-400 body-2-regular">Coupon</span>
          <span className={coupon?.coupons?.color || 'text-brand-red'}>
            {discountAmount ? `-${discountAmount} บาท` : '-'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base-gray-400 body-2-regular">Total</span>
          <span className="text-white body-1-medium">{finalTotal || 0} บาท</span>
        </div>
      </div>
      <CouponAlert 
        open={showBookingError} 
        onClose={() => setShowBookingError(false)}
        text={bookingError?.message}
        text_sub="กรุณาลองใหม่อีกครั้ง"
        type="error"
      />
      <CouponAlert 
        open={showCouponError} 
        onClose={() => setShowCouponError(false)}
        text={couponError}
        text_sub="กรุณาเลือกคูปองใหม่อีกครั้ง"
        type="error"
      />
      <Button
        className="!w-full !h-[48px] !rounded-[4px] self-center mt-4"
        onClick={handleNext}
        disabled={disabled || !data?.booking || !!couponError}
      >
        Next
      </Button>
    </div>
  );
} 