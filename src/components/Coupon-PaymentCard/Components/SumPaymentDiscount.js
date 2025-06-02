import Button from '../../Button';
import { useTestBooking } from '@/hooks/testBooking';
import { useCoupon } from '@/hooks/useCoupon';
import { useState, useEffect } from 'react';
import CouponAlert from '../../Coupons-components/CouponAlert';
import useCountdown from '@/hooks/useCountdown';

export default function SumPaymentDiscount({ coupon, disabled, showtimes, bookingId }) {
  const { data, loading: bookingLoading, error: bookingError } = useTestBooking(showtimes, bookingId);
  const { loading: couponLoading, error: couponError, discountAmount, checkCoupon, applyCoupon } = useCoupon();
  const [checkResult, setCheckResult] = useState(null);
  const [showBookingError, setShowBookingError] = useState(false);
  const [showCouponError, setShowCouponError] = useState(false);
  console.log(showtimes);
  
  
  // อัพเดท showBookingError เมื่อมี bookingError
  useEffect(() => {
    if (bookingError) {
      setShowBookingError(true);
    }
  }, [bookingError]);

  // อัพเดท showCouponError เมื่อมี couponError
  useEffect(() => {
    if (couponError) {
      setShowCouponError(true);
    }
  }, [couponError]);

  // เช็คคูปองเมื่อมีการเลือกคูปอง
  useEffect(() => {
    const checkCouponValidity = async () => {
      console.log('Checking coupon validity with:', {
        coupon,
        bookingId: data?.booking_id
      });

      if (!coupon?.coupons?.coupon_id || !data?.booking_id) {
        console.log('Missing required data:', {
          hasCouponId: !!coupon?.coupons?.coupon_id,
          hasBookingId: !!data?.booking_id
        });
        return;
      }
      
      try {
        const result = await checkCoupon(data.booking_id, coupon.coupons.coupon_id);
        console.log('Coupon check result:', result);
        setCheckResult(result);
      } catch (error) {
        console.error('Error checking coupon:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setCheckResult(null);
      }
    };

    checkCouponValidity();
  }, [coupon, data?.booking_id]);

  // ปรับปรุง handleNext
  const handleNext = async () => {
    try {
      if (checkResult.discount_amount > 0) {
        await applyCoupon(data.booking_id, coupon.coupons.coupon_id, checkResult.discount_amount);
      }
    } catch (error) {
      console.error('Error applying coupon:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    
  };

  if (bookingLoading || couponLoading) {
    return <div>กำลังโหลด...</div>;
  }

  const finalTotal = data?.total_price - (discountAmount || 0);

  return (
    <div >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Booking price</span>
          <span>THB{data?.total_price || 0} </span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Coupon</span>
          <span className={coupon?.coupons?.color || 'text-brand-red'}>
            {discountAmount ? `-THB${discountAmount} ` : '-'}
          </span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Total</span>
          <span>THB{finalTotal || 0} </span>
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
        disabled={disabled || !data || !!couponError}
      >
        Next
      </Button>
    </div>
  );
} 