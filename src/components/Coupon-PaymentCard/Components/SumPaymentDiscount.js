import Button from "../../Button";
import { useTestBooking } from "@/hooks/testBooking";
import { useCoupon } from "@/hooks/useCoupon";
import { useState, useEffect, useRef } from "react";
import CouponAlert from "../../Coupons-components/CouponAlert";
import useCountdown from "@/hooks/useCountdown";
import useApplyPayment from "@/hooks/useApplyPayment";
import { useRouter } from "next/router";
import ConfirmBookingPopup from "../../PaymentSystem/ConfirmBookingPopup";
import { usePayment } from "@/context/PaymentContext";
import { useStatus } from "@/context/StatusContext";

export default function SumPaymentDiscount({
  coupon,
  disabled,
  showtimes,
  bookingId,
  couponId,
  bookingSeats,
  paymentMethod,
  isCardComplete,
  userId
}) {
  const {
    data,
    loading: bookingLoading,
    error: bookingError,
  } = useTestBooking(showtimes, bookingId);
  const {
    loading: couponLoading,
    error: couponError,
    discountAmount,
    checkCoupon,
    applyCoupon,
  } = useCoupon();
  const {
    applyPayment,
    loading: paymentLoading,
    error: paymentError,
    result: paymentResult,
  } = useApplyPayment();
  const [checkResult, setCheckResult] = useState(0);
  const [showBookingError, setShowBookingError] = useState(false);
  const [showCouponError, setShowCouponError] = useState(false);
  const { cancelCouponStatus, cancelCoupon } = useCountdown(
    couponId,
    bookingId
  );
  const [finalPrice, setFinalPrice] = useState(0);
  const router = useRouter();
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const { cardFormRef, setBookingData, setUserId: setPaymentUserId } = usePayment();
  const { user } = useStatus();

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
      if (!coupon?.coupons?.coupon_id || !data?.booking_id) {
        return;
      }

      try {
        const result = await checkCoupon(
          data.booking_id,
          coupon.coupons.coupon_id,
          data.total_price
        );
        setCheckResult(result);
      } catch (error) {
        setCheckResult(null);
      }
    };

    checkCouponValidity();
  }, [coupon, data?.booking_id, data?.total_price]);

  useEffect(() => {
    if (
      checkResult &&
      typeof checkResult.final_price !== "undefined" &&
      checkResult.final_price !== null
    ) {
      setFinalPrice(Number(checkResult.final_price));
    } else if (data && typeof data.total_price !== "undefined") {
      setFinalPrice(Number(data.total_price));
    } else {
      setFinalPrice(null);
    }
  }, [checkResult, data]);

  // ส่งข้อมูล booking และ userId ไปยัง Context เมื่อมีข้อมูล
  useEffect(() => {
    if (data && setBookingData) {
      setBookingData({
        ...data,
        id: data.booking_id,
        total: data.total_price
      });
    }
    if (user?.id && setPaymentUserId) {
      setPaymentUserId(user.id);
    }
    // ไม่ต้องเชื่อมต่อ localCardFormRef เพราะเราลบ hidden form ออกแล้ว
    // cardFormRef จะมาจาก PaymentMobile.js แทน
  }, [data, user?.id, setBookingData, setPaymentUserId]);

  // handleNext เปลี่ยนเป็นเปิด popup
  const handleNext = (e) => {
    e.preventDefault();
    console.log('[SumPaymentDiscount] handleNext called');
    console.log('[SumPaymentDiscount] paymentMethod:', paymentMethod);
    console.log('[SumPaymentDiscount] isCardComplete:', isCardComplete);
    console.log('[SumPaymentDiscount] data:', JSON.stringify(data, null, 2));
    
    if (paymentMethod === "Credit card" && !isCardComplete) {
      console.log('[SumPaymentDiscount] Card not complete, returning');
      return;
    }
    if (!data) {
      console.log('[SumPaymentDiscount] No data, returning');
      return;
    }
    console.log('[SumPaymentDiscount] Opening confirm popup');
    setOpenConfirmPopup(true);
  };

  // ฟังก์ชันสำหรับยืนยันใน popup
  const handleConfirmPayment = async () => {
    setConfirmLoading(true);
    setConfirmError("");
    console.log('[SumPaymentDiscount] handleConfirmPayment called');
    console.log('[SumPaymentDiscount] paymentMethod:', paymentMethod);
    console.log('[SumPaymentDiscount] cardFormRef:', cardFormRef);
    console.log('[SumPaymentDiscount] cardFormRef.current:', cardFormRef?.current);
    
    try {
      let paymentStatus = "pending";
      if (paymentMethod === "Credit card") {
        // ใช้ cardFormRef.current.pay() แทนการ hardcode
        if (!cardFormRef?.current) {
          setConfirmError("ไม่พบข้อมูลบัตรเครดิต กรุณาลองใหม่");
          setConfirmLoading(false);
          return;
        }
        
        console.log('[SumPaymentDiscount] Processing credit card payment via cardFormRef...');
        const paymentResult = await cardFormRef.current.pay();
        
        if (paymentResult.error) {
          setConfirmError(paymentResult.error);
          setConfirmLoading(false);
          return;
        }
        
        console.log('[SumPaymentDiscount] Payment completed successfully');
        setOpenConfirmPopup(false);
        router.push(`/payment-success?bookingId=${data.booking_id}`);
        return;
        
      } else if (paymentMethod === "QR code" || paymentMethod === "QR Code") {
        // สำหรับ QR Code Payment
        try {
          const res = await fetch("/api/create-promptpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: finalPrice * 100 }),
          });
          const qrData = await res.json();
          if (qrData.error) throw new Error(qrData.error);
          
          setOpenConfirmPopup(false);
          router.push(
            `/payment-qr?chargeId=${qrData.chargeId}&amount=${finalPrice}&bookingId=${data.booking_id}`
          );
          return;
        } catch (error) {
          setConfirmError(error.message || "เกิดข้อผิดพลาดในการสร้าง QR Code");
          setConfirmLoading(false);
          return;
        }
      }
      
      // สำหรับ payment method อื่นๆ
      if (checkResult && checkResult.discount_amount > 0) {
        await applyCoupon(
          data.booking_id,
          coupon.coupons.coupon_id,
          checkResult.discount_amount
        );
        await cancelCouponStatus(couponId);
        await cancelCoupon(couponId, data.booking_id);
      }
      if (!data || !data.booking_id) {
        setConfirmError("กรุณาตรวจสอบข้อมูล booking_id ให้ถูกต้อง");
        setConfirmLoading(false);
        return;
      }
      if (!finalPrice || finalPrice <= 0) {
        setConfirmError("ราคาสุทธิไม่ถูกต้อง");
        setConfirmLoading(false);
        return;
      }
      await applyPayment({
        bookingId: data.booking_id,
        finalPrice: finalPrice,
        paymentMethod: paymentMethod,
        payment_status: paymentStatus,
      });
      setOpenConfirmPopup(false);
      router.push(`/payment-success?bookingId=${data.booking_id}`);
    } catch (error) {
      setConfirmError(error?.message || "เกิดข้อผิดพลาด");
    } finally {
      setConfirmLoading(false);
    }
  };

  if (bookingLoading || couponLoading) {
    return <div>กำลังโหลด...</div>;
  }

  const finalTotal = data?.total_price - (discountAmount || 0);

  let seatNumber = [];
  try {
    seatNumber = bookingSeats ? JSON.parse(bookingSeats) : [];
  } catch (e) {
    seatNumber = [];
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Booking seats</span>
          <span>{seatNumber.join(", ")}</span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Booking price</span>
          <span>THB{data?.total_price || 0} </span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Payment method</span>
          <span>{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Coupon</span>
          <span className={coupon?.coupons?.color || "text-brand-red"}>
            {discountAmount ? `-THB${discountAmount} ` : "-"}
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
        disabled={paymentMethod === "Credit card" ? !isCardComplete : !data}
      >
        Next
      </Button>
      {openConfirmPopup && data && (
        <ConfirmBookingPopup
          open={openConfirmPopup}
          onClose={() => setOpenConfirmPopup(false)}
          onConfirm={handleConfirmPayment}
          loading={confirmLoading}
          error={confirmError}
        >
          <div>
            <p>ยืนยันการจ่ายเงิน</p>
            {paymentMethod === "Credit card" && (
              <p>การชำระเงินด้วยบัตรเครดิต</p>
            )}
          </div>
        </ConfirmBookingPopup>
      )}
    </div>
  );
}
