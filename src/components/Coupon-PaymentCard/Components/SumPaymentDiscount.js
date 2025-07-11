import Button from "../../Button";
import { useTestBooking } from "@/hooks/testBooking";
import { useCoupon } from "@/hooks/useCoupon";
import { useState, useEffect, useRef } from "react";
import CouponAlert from "../../Coupons-components/CouponAlert";
import useCountdown from "@/hooks/useCountdown";
import useApplyPayment from "@/hooks/useApplyPayment";
import { useRouter } from "next/router";
import ConfirmBookingPopup from "../../PaymentSystem/ConfirmBookingPopup";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeCardForm from "../../PaymentSystem/StripeCardForm";
import { usePayment } from "@/context/PaymentContext";
import { useStatus } from "@/context/StatusContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function SumPaymentDiscount({
  coupon,
  disabled,
  showtimes,
  bookingId,
  couponId,
  bookingSeats,
  paymentMethod,
  isCardComplete,
  userId,
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
    setDiscountAmount,
  } = useCoupon();
  const {
    applyPayment,
    loading: paymentLoading,
    error: paymentError,
    result: paymentResult,
  } = useApplyPayment();
  const [checkResult, setCheckResult] = useState();
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
  const {
    cardFormRef,
    setBookingData,
    setUserId: setPaymentUserId,
    setCardFormRef,
  } = usePayment();
  const { user } = useStatus();
  const localCardFormRef = useRef(null);

  // ฟังก์ชันสำหรับล้างข้อมูลการคำนวณ
  const resetCalculation = () => {
    setCheckResult(null);
    setFinalPrice(0);
    setDiscountAmount(0);
  };

  // ตรวจสอบเมื่อมีการลบคูปอง
  useEffect(() => {
    if (!coupon?.coupons?.coupon_id) {
      resetCalculation();
    }
  }, [coupon]);

  // รีเซ็ต alert box เมื่อมีการเปลี่ยนคูปอง
  useEffect(() => {
    setShowCouponError(false);
  }, [coupon]);

  // อัพเดท showBookingError เมื่อมี bookingError
  useEffect(() => {
    setCheckResult(data?.total_price);
  }, [data]);

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
        console.error("เกิดข้อผิดพลาดในการเช็คคูปอง:", error);
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
        total: data.total_price,
      });
    }
    if (user?.id && setPaymentUserId) {
      setPaymentUserId(user.id);
    }
    // เชื่อมต่อ cardFormRef ใน Context
    if (setCardFormRef && localCardFormRef.current) {
      setCardFormRef(localCardFormRef);
    }
  }, [data, user?.id, setBookingData, setPaymentUserId, setCardFormRef]);

  // handleNext เปลี่ยนเป็นเปิด popup
  const handleNext = (e) => {
    e.preventDefault();
    if (paymentMethod === "Credit card" && !isCardComplete) {
      return;
    }
    if (!data) {
      return;
    }
    setOpenConfirmPopup(true);
  };

  // ฟังก์ชันสำหรับยืนยันใน popup
  const handleConfirmPayment = async () => {
    setConfirmLoading(true);
    setConfirmError("");

    try {
      let paymentStatus = "pending";

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

      const paymentResult = await applyPayment({
        bookingId: data.booking_id,
        userId: user.id,
        finalPrice: finalPrice,
        paymentMethod: paymentMethod,
        payment_status: paymentStatus,
      });

      if (coupon?.coupons?.coupon_id) {
        await applyCoupon(
          data.booking_id,
          coupon.coupons.coupon_id,
          discountAmount
        );
      }

      if (paymentMethod === "Credit card") {
        if (cardFormRef?.current?.pay) {
          try {
            const result = await cardFormRef.current.pay();
            if (result.success) {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("lastPaymentMethod", "Credit card");
              }
              setOpenConfirmPopup(false);
              if (coupon?.coupons?.coupon_id) {
                try {
                  await fetch("/api/use-coupon/update-status-coupon", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      coupon_id: coupon.coupons.coupon_id,
                    }),
                  });
                } catch (error) {
                  console.error("เกิดข้อผิดพลาดในการอัพเดทสถานะคูปอง");
                }
              }
              router.push(
                `/payment-success?bookingId=${data.booking_id}&fromCard=true`
              );
              return;
            } else {
              setConfirmError(
                result.error || "Payment processing error occurred"
              );
              setConfirmLoading(false);
              return;
            }
          } catch (error) {
            setConfirmError("Payment processing error occurred");
            setConfirmLoading(false);
            return;
          }
        } else {
          setConfirmError("Payment system is not ready. Please try again.");
          setConfirmLoading(false);
          return;
        }
      } else if (paymentMethod === "QR code" || paymentMethod === "QR Code") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("lastPaymentMethod", "QR Code");
        }

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
            `/payment-qr?chargeId=${qrData.chargeId}&amount=${finalPrice}&bookingId=${data.booking_id}&couponId=${couponId}`
          );
          return;
        } catch (error) {
          setConfirmError(error.message || "เกิดข้อผิดพลาดในการสร้าง QR Code");
          setConfirmLoading(false);
          return;
        }
      }

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
    return <div>Loading...</div>;
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
          <span className="font-bold text-white">{seatNumber.join(", ")}</span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Booking price</span>
          <span className="font-bold text-white">
            THB{data?.total_price || 0}{" "}
          </span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Payment method</span>
          <span className="font-bold text-white">{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Coupon</span>
          <span className={coupon?.coupons?.color || "text-brand-red"}>
            {discountAmount ? `-THB${discountAmount} ` : "-"}
          </span>
        </div>
        <div className="flex justify-between items-center text-[--base-gray-300] text-base">
          <span>Total</span>
          <span className="font-bold text-white">THB{finalTotal || 0} </span>
        </div>
      </div>

      {/* Hidden Stripe Card Form สำหรับ Credit Card Payment */}
      {paymentMethod === "Credit card" && (
        <div className="hidden">
          <Elements stripe={stripePromise}>
            <StripeCardForm
              ref={localCardFormRef}
              setIsCardComplete={() => {}}
              booking={{
                id: data?.booking_id,
                total: finalPrice || data?.total_price || 0,
                movie_id: data?.movie_id,
                couponId: couponId || null,
              }}
              userId={user?.id}
            />
          </Elements>
        </div>
      )}

      <CouponAlert
        open={showBookingError}
        onClose={() => setShowBookingError(false)}
        text={bookingError?.message}
        text_sub="Please try again"
        type="error"
      />
      <CouponAlert
        open={showCouponError}
        onClose={() => setShowCouponError(false)}
        text={couponError}
        text_sub="Please select a new coupon"
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
            <p>Confirm Payment</p>
            {paymentMethod === "Credit card" && <p>Credit Card Payment</p>}
          </div>
        </ConfirmBookingPopup>
      )}
    </div>
  );
}
