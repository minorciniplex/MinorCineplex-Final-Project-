import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import Navbar from "../Navbar/Navbar";
import CheckIcon from "@mui/icons-material/Check";
import Image from "next/image";
import MovieInfoCard from "./MovieInfoCard";
import { useBookingDetail } from "@/hooks/useBookingDetail";
import CouponDiscount from "./CouponDiscount";
import { useMyCoupons } from "@/hooks/useMyCoupons";
import CouponSelectPopup from "./CouponSelectPopup";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import ConfirmBookingPopup from "./ConfirmBookingPopup";
import CouponPaymentCard from "../Coupon-PaymentCard/CouponApply";
import { usePayment } from "@/context/PaymentContext";
import { useStatus } from "../../context/StatusContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#fff",
      backgroundColor: "",
      "::placeholder": {
        color: "#8B93B0",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  disableAutofill: true,
};

const CARD_NUMBER_OPTIONS = {
  ...ELEMENT_OPTIONS,
  placeholder: "Card number",
  showIcon: true,
};
const CARD_EXPIRY_OPTIONS = {
  ...ELEMENT_OPTIONS,
  placeholder: "MM/YY",
};
const CARD_CVC_OPTIONS = {
  ...ELEMENT_OPTIONS,
  placeholder: "CVC",
};

const StripeCardForm = forwardRef(function StripeCardForm(
  { setIsCardComplete, booking, userId },
  ref
) {
  const stripe = useStripe();
  const elements = useElements();
  const [owner, setOwner] = useState("");
  const [isCardNumberComplete, setIsCardNumberComplete] = useState(false);
  const [isExpiryComplete, setIsExpiryComplete] = useState(false);
  const [isCvcComplete, setIsCvcComplete] = useState(false);

  // เพิ่ม validation states สำหรับแสดง error messages
  const [cardNumberError, setCardNumberError] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvcError, setCvcError] = useState("");
  const [touched, setTouched] = useState({
    cardNumber: false,
    owner: false,
    expiry: false,
    cvc: false
  });

  useEffect(() => {
    const cardComplete = isCardNumberComplete &&
        isExpiryComplete &&
        isCvcComplete &&
        owner.trim() !== "";
    
    // Validation logic เมื่อ user ได้แตะฟิลด์แล้ว
    if (touched.cardNumber && !isCardNumberComplete) {
      setCardNumberError("Card number is not valid");
    } else {
      setCardNumberError("");
    }
    
    if (touched.owner && owner.trim() === "") {
      setOwnerError("Card owner name is not valid");
    } else {
      setOwnerError("");
    }
    
    if (touched.expiry && !isExpiryComplete) {
      setExpiryError("Expiry date is not valid");
    } else {
      setExpiryError("");
    }
    
    if (touched.cvc && !isCvcComplete) {
      setCvcError("CVC is not valid");
    } else {
      setCvcError("");
    }
    
    // Card validation complete
    
    setIsCardComplete(cardComplete);
  }, [
    isCardNumberComplete,
    isExpiryComplete,
    isCvcComplete,
    owner,
    setIsCardComplete,
    touched.cardNumber,
    touched.owner,
    touched.expiry,
    touched.cvc,
  ]);

  // expose ฟังก์ชันจ่ายเงินผ่าน ref
  useImperativeHandle(ref, () => ({
    async pay() { 
      // แปลงและตรวจสอบ amount
      let amount = booking?.total_price || booking?.total;
      if (typeof amount === "string") {
        amount = Number(amount.replace(/,/g, ""));
      }
      amount = Number(amount);
      if (!amount || isNaN(amount)) {
        return { error: "Invalid amount" };
      }
      
              if (!stripe || !elements) return { error: "Stripe not ready" };
        
        const bookingIdReal = booking?.booking_id || booking?.id;
        const movieId = booking?.movie_id;
      
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            userId,
            bookingId: bookingIdReal,
            movieId,
          }),
        });
        const { clientSecret } = await res.json();
        
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement)
          return { error: "Please fill in all card information" };
          
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardNumberElement,
              billing_details: { name: owner },
            },
          });
          
        if (confirmError) {
          return { error: confirmError.message };
        }
        
        // ตรวจสอบสถานะการชำระเงิน
        if (!paymentIntent) {
          return { error: "Unable to create paymentIntent" };
        }
        
        if (paymentIntent.status !== "succeeded") {
          return { error: "Payment failed. Please try again" };
        }
        
        // บันทึกข้อมูลการชำระเงิน
        const paymentData = {
          payment_intent_id: paymentIntent.id,
          amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          payment_method: "card",
          payment_details: paymentIntent,
          user_id: userId,
          booking_id: bookingIdReal,
        };
        const { data, error: supaError } = await supabase
          .from("movie_payments")
          .insert([paymentData]);
        
        if (supaError) {
          return {
            error: "Failed to save data to database: " + supaError.message,
          };
        }
          
        // เรียก mark-paid API หลังจ่ายเงินสำเร็จ
        
        try {
          const markPaidRes = await fetch("/api/booking/mark-paid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: bookingIdReal }),
          });
          
          // ตรวจสอบว่า response เป็น JSON หรือไม่
          const contentType = markPaidRes.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            // ถ้าไม่ใช่ JSON ให้อ่านเป็น text
            const textResponse = await markPaidRes.text();
            
            if (markPaidRes.status === 401) {
              return { error: "กรุณาเข้าสู่ระบบใหม่" };
            } else if (markPaidRes.status === 405) {
              return { error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" };
            } else {
              return { error: "เกิดข้อผิดพลาดในการอัพเดทการจอง" };
            }
          }
          
          const markPaidData = await markPaidRes.json();
          
          if (!markPaidRes.ok || !markPaidData.success) {
            const errorMsg = markPaidData.error || `HTTP ${markPaidRes.status}`;
            return { error: "Failed to update booking: " + errorMsg };
          }
        } catch (markPaidError) {
          // ถ้า mark-paid ล้มเหลว แต่ payment สำเร็จแล้ว ให้เก็บ log และดำเนินการต่อ
          // อย่า return error เพราะเงินถูกหักแล้ว
          
          // บันทึก error ลง local storage เพื่อให้หน้า success แสดงข้อความแจ้ง
          localStorage.setItem("payment_success_with_booking_update_error", JSON.stringify({
            bookingId: bookingIdReal,
            error: markPaidError.message,
            timestamp: new Date().toISOString()
          }));
        }
        
        return { success: true };
      } catch (err) {
        return { error: "Payment error occurred. Please try again" };
      }
    },
  }));

  return (
    <form
      className="px-4 mb-10 lg:mb-0 space-y-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="lg:flex lg:space-x-4">
        <div className="lg:flex-1">
          <label className="block text-sm text-base-gray-400 mb-1">
            Card number
          </label>
          <CardNumberElement
            options={CARD_NUMBER_OPTIONS}
            className="w-full h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-[4px] pl-4 py-3 pr-3 text-base placeholder-base-gray-300 outline-none"
            onChange={(e) => {
              setIsCardNumberComplete(e.complete);
              setTouched(prev => ({ ...prev, cardNumber: true }));
            }}
          />
          {cardNumberError && (
            <p className="text-red-500 text-sm mt-1">{cardNumberError}</p>
          )}
        </div>
        <div className="lg:flex-1 mt-4 lg:mt-0">
          <label className="block text-sm text-base-gray-400 mb-1">
            Card owner
          </label>
          <input
            className="w-full h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md pl-4 py-3 pr-3 text-base placeholder-base-gray-300 outline-none"
            placeholder="Card owner name"
            value={owner}
            onChange={(e) => {
              setOwner(e.target.value);
              setTouched(prev => ({ ...prev, owner: true }));
            }}
          />
          {ownerError && (
            <p className="text-red-500 text-sm mt-1">{ownerError}</p>
          )}
        </div>
      </div>
      <div className="lg:flex lg:space-x-4 items-center">
        <div className="lg:flex-1">
          <label className="block text-sm text-base-gray-400 mb-1">
            Expiry date
          </label>
          <CardExpiryElement
            options={CARD_EXPIRY_OPTIONS}
            className="w-full h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-[4px] pl-4 py-3 pr-3 text-base placeholder-base-gray-300 outline-none"
            onChange={(e) => {
              setIsExpiryComplete(e.complete);
              setTouched(prev => ({ ...prev, expiry: true }));
            }}
          />
          {expiryError && (
            <p className="text-red-500 text-sm mt-1">{expiryError}</p>
          )}
        </div>
        <div className="lg:flex-1 mt-4 lg:mt-0">
          <label className="block text-sm text-base-gray-400 mb-1">
            CVC
          </label>
          <CardCvcElement
            options={CARD_CVC_OPTIONS}
            className="w-full h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-[4px] pl-4 py-3 pr-3 text-base placeholder-base-gray-300 outline-none"
            onChange={(e) => {
              setIsCvcComplete(e.complete);
              setTouched(prev => ({ ...prev, cvc: true }));
            }}
          />
          {cvcError && (
            <p className="text-red-500 text-sm mt-1">{cvcError}</p>
          )}
        </div>
      </div>
    </form>
  );
});

function PromptPayQR() {
  const [qrUrl, setQrUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [chargeId, setChargeId] = useState(null);
  const [qrStatus, setQrStatus] = useState(null);
  const [saved, setSaved] = useState(false);
  const handleGetQR = async () => {
    setQrLoading(true);
    setQrError(null);
    setQrUrl(null);
    setQrStatus(null);
    setChargeId(null);
    setSaved(false);
    try {
      const res = await fetch("/api/create-promptpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 29900 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQrUrl(data.qr);
      setChargeId(data.chargeId);
      setQrStatus(data.status);
    } catch (err) {
      setQrError(err.message);
    }
    setQrLoading(false);
  };
  useEffect(() => {
    if (!chargeId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/check-promptpay-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chargeId }),
        });
        const data = await res.json();
        setQrStatus(data.status);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [chargeId]);

  // เพิ่ม useEffect สำหรับบันทึกข้อมูลลง Supabase เมื่อจ่ายเงิน QR สำเร็จ
  useEffect(() => {
    if (qrStatus === "successful" && chargeId && !saved) {
      const saveToSupabase = async () => {
        // ใช้ข้อมูลจริงจาก context หรือ fallback
        const mockUserId = userId || null;
        const mockBookingId = bookingId || null;
        const mockMovieId = null;
        const mockAmount = 0;
        // ดึงข้อมูล charge จาก Omise API (ผ่าน API server)
        const res = await fetch("/api/check-promptpay-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chargeId }),
        });
        const data = await res.json();
        // บันทึกลง Supabase
        const { data: supaData, error: supaError } = await supabase
          .from("movie_payments")
          .insert([
            {
              payment_intent_id: chargeId,
              amount: mockAmount,
              currency: "thb",
              status: "successful",
              payment_method: "promptpay",
              payment_details: data, // หรือ data.charge
              user_id: mockUserId,
              booking_id: mockBookingId,
              movie_id: mockMovieId,
            },
          ]);
        if (supaError) {
          alert("Failed to save data: " + supaError.message);
        } else {
          alert("Data saved successfully!");
          setSaved(true);
        }
      };
      saveToSupabase();
    }
  }, [qrStatus, chargeId, saved]);

  if (!qrUrl) {
    return (
      <>
        <div>QR Code Payment</div>
        <button
          className="mt-4 bg-brand-blue-200 text-white py-2 px-6 rounded"
          onClick={handleGetQR}
          disabled={qrLoading}
        >
          {qrLoading ? "Creating QR..." : "Create PromptPay QR"}
        </button>
        {qrError && <div className="text-red-500 mt-2">{qrError}</div>}
      </>
    );
  }
  return (
    <>
      <Image src={qrUrl} alt="PromptPay QR" width={180} height={180} />
      <div className="mt-2 text-xs text-center w-full text-white">
        Scan QR with banking app to pay
      </div>
      <div className="mt-2 text-xs text-center w-full text-white">
        Status: {qrStatus}
      </div>
    </>
  );
}

export default function PaymentMobile({ setPaymentMethod, isCardComplete, setIsCardComplete, bookingId: propBookingId }) {
  const router = useRouter();
  const [tab, setTab] = useState("credit");
  const { setCardFormRef, bookingData, userId: paymentUserId } = usePayment();
  const [card, setCard] = useState({
    number: "",
    owner: "",
    expiry: "",
    cvc: "",
  });
  const expiryInputRef = useRef(null);
  const [openCouponPopup, setOpenCouponPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const cardFormRef = useRef();

  // ส่ง cardFormRef ให้ Context
  useEffect(() => {
    if (setCardFormRef && cardFormRef?.current) {
      setCardFormRef(cardFormRef);
    }
  }, [setCardFormRef, cardFormRef?.current]);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [chargeId, setChargeId] = useState(null);
  const [qrStatus, setQrStatus] = useState(null);

  // ดึง bookingId และ userId จาก props และ context
  const { bookingId: contextBookingId, user } = usePayment();
  const { user: statusUser } = useStatus();
  
  const bookingId = propBookingId || contextBookingId || "189fedc3-e260-4073-8ac1-7a6dac9a1498"; // fallback to latest booking
  const userId = user?.id || statusUser?.id || "b16e32f8-86b8-4f74-bcbe-3c3d1472027a";
  
  const { booking, loading } = useBookingDetail(bookingId);
  const { coupons, loading: loadingCoupons } = useMyCoupons(userId);

  // ฟังก์ชันเมื่อกด Next
  const handleNext = (e) => {
    e.preventDefault();
    if (tab === "credit" && !isCardComplete) return;
    setOpenConfirmPopup(true);
  };

  // ฟังก์ชันจ่ายเงินจริงเมื่อกด Confirm
  const handleConfirmPayment = async () => {
    setConfirmLoading(true);
    setConfirmError(null);
    
    if (cardFormRef.current && cardFormRef.current.pay) {
      try {
        const result = await cardFormRef.current.pay();
        
        if (result.success) {
          // บันทึกว่าจ่ายด้วย credit card
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('lastPaymentMethod', 'Credit card');
          }
          
          setConfirmLoading(false);
          setOpenConfirmPopup(false);
          router.push(`/payment-success?bookingId=${booking?.booking_id || booking?.id}&fromCard=true`);
        } else {
          setConfirmError(
            result.error || "Payment error occurred. Please try again"
          );
          setConfirmLoading(false);
        }
      } catch (error) {
        setConfirmError(error.message || "Payment error occurred");
        setConfirmLoading(false);
      }
    } else {
      setConfirmError("Unable to process payment");
      setConfirmLoading(false);
    }
  };

  // ฟังก์ชันเมื่อกด Confirm ใน QR Tab
  const handleConfirmQR = async () => {
    setConfirmLoading(true);
    setQrError(null);
    
    // บันทึกว่าจ่ายด้วย QR Code
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lastPaymentMethod', 'QR Code');
    }
    
    try {
      const res = await fetch("/api/create-promptpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: (booking?.total_price || booking?.total) * 100 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQrUrl(data.qr);
      setChargeId(data.chargeId);
      setQrStatus(data.status);
      setOpenConfirmPopup(false);
      router.push(
        `/payment-qr?chargeId=${data.chargeId}&amount=${booking?.total_price || booking?.total}&bookingId=${booking?.booking_id || booking?.id}`
      );
    } catch (err) {
      setQrError(err.message);
    }
    setConfirmLoading(false);
  };

  // ติดตามสถานะ QR
  useEffect(() => {
    if (!chargeId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/check-promptpay-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chargeId }),
        });
        const data = await res.json();
        setQrStatus(data.status);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [chargeId]);

  // ฟังก์ชันเปลี่ยน tab และส่งค่า paymentMethod ออกไป
  const handleTabChange = (method) => {
    setTab(method);
    if (setPaymentMethod) {
      setPaymentMethod(method === "credit" ? "Credit card" : "QR code");
    }
  };

  if (loading) return <div>Loading...</div>;
  // fallback data สำหรับเมื่อไม่มีข้อมูล booking
  const mockBooking = {
    movie_title: "",
    genres: [],
    movie_poster: "",
    cinema_name: "",
    show_date: "",
    show_time: "",
    hall: "",
    languages: [],
    coupon_name: "",
    coupon_discount: 0,
    seat: [],
    payment_method: "",
    total: 0,
  };

  // ถ้า booking มีข้อมูลจริง ให้ map field ให้ตรงกับ props และแปลง string เป็น array ถ้าจำเป็น
  const data = booking
    ? {
        ...booking,
        genres:
          typeof booking.genres === "string"
            ? JSON.parse(booking.genres)
            : booking.genres,
        languages:
          typeof booking.languages === "string"
            ? JSON.parse(booking.languages)
            : booking.languages,
        seat:
          typeof booking.seat === "string"
            ? JSON.parse(booking.seat)
            : booking.seat,
            
      }
    : mockBooking;

  return (
    <div className="flex bg-background text-white font-sans overflow-x-hidden flex-col w-full">
      <div className="flex flex-col justify-between items-start w-full">
        {/* ฝั่งซ้าย: ฟอร์ม */}
        <div className="w-full">
          {/* Tab */}
          <div className="flex gap-4 items-baseline pt-6 pb-6 px-4 lg:pt-0 lg:px-0 lg:pb-6 lg:ml-4">
            <button
              className="flex justify-center lg:mb-[50px]"
              onClick={() => handleTabChange("credit")}
            >
              <span
                className={`text-lg lg:text-xl font-semibold pb-1 px-[7px] inline-block ${
                  tab === "credit"
                    ? "border-b-[1px] border-[#565F7E] text-white"
                    : "border-b-0 text-[#8B93B0]"
                }`}
              >
                Credit card
              </span>
            </button>
            <button
              className="flex justify-center lg:ml-8"
              onClick={() => handleTabChange("qr")}
            >
              <span
                className={`text-lg lg:text-xl font-semibold pb-1 inline-block ${
                  tab === "qr"
                    ? "border-b-[1px] border-[#565F7E] text-white"
                    : "border-b-0 text-[#8B93B0]"
                }`}
              >
                QR Code
              </span>
            </button>
          </div>

          {/* Credit Card Form */}
          {tab === "credit" && (
            <Elements 
              stripe={stripePromise}
              options={{
                // ปิด autocomplete และ autofill เพื่อลด popup เตือน
                appearance: {
                  theme: 'none',
                },
                // ตั้งค่าเพิ่มเติมเพื่อลด warning
                loader: 'auto',
              }}
            >
              <StripeCardForm
                ref={cardFormRef}
                setIsCardComplete={setIsCardComplete}
                booking={bookingData || booking}
                userId={paymentUserId || userId}
              />
            </Elements>
          )}

          {/* QR Code Tab */}
          {tab === "qr" && (
            <div className="px-4 mt-4 mb-8 flex flex-col items-center text-gray-400 w-full ">
              {/* ถ้ายังไม่มี qrUrl ให้แสดงปุ่ม Next -> Confirm -> สร้าง QR */}
              {!qrUrl ? (
                <>
                  <div className="bg-[#232B47] rounded py-10 w-full lg:w-[793px] min-h-[104px] flex items-center justify-center flex-col">
                    <span className="text-white text-lg font-medium">QR Code Payment</span>
                    {qrError && (
                      <div className="text-red-500 mt-2 text-sm text-center">{qrError}</div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-center w-full">
                    Scan QR code to pay
                  </div>
                </>
              ) : (
                <div className="bg-[#232B47] rounded py-10 w-full lg:w-[793px] flex flex-col items-center justify-center">
                  <Image
                    src={qrUrl}
                    alt="PromptPay QR"
                    width={180}
                    height={180}
                    className="max-w-[160px] lg:max-w-[180px]"
                  />
                  <div className="mt-4 text-white font-bold text-base lg:text-lg text-center">
                    Minor Cineplex Public limited company
                  </div>
                  <div className="mt-2 text-white font-bold text-lg lg:text-xl">
                    THB{(booking?.total_price || booking?.total || 0).toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs text-center w-full text-white">
                    {qrStatus && `Status: ${qrStatus}`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* mount popup confirm */}
      <ConfirmBookingPopup
        open={openConfirmPopup}
        onClose={() => setOpenConfirmPopup(false)}
        onConfirm={tab === "qr" ? handleConfirmQR : handleConfirmPayment}
        loading={confirmLoading}
        error={confirmError || qrError}
      />
    </div>
  );
}
