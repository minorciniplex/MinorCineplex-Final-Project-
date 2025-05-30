import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import Navbar from "../Navbar/Navbar";
import CheckIcon from '@mui/icons-material/Check';
import Image from 'next/image';
import MovieInfoCard from "./MovieInfoCard";
import { useBookingDetail } from '@/hooks/useBookingDetail';
import SumPaymentDiscount from './SumPaymentDiscount';
import CouponDiscount from './CouponDiscount';
import { useMyCoupons } from '@/hooks/useMyCoupons';
import CouponSelectPopup from './CouponSelectPopup';
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import supabase from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import ConfirmBookingPopup from './ConfirmBookingPopup';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#fff",
      backgroundColor: "#232B47",
      '::placeholder': {
        color: "#8B93B0"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  }
};

const StripeCardForm = forwardRef(function StripeCardForm({ setIsCardComplete, booking, userId }, ref) {
  const stripe = useStripe();
  const elements = useElements();
  const [owner, setOwner] = useState("");
  const [isCardNumberComplete, setIsCardNumberComplete] = useState(false);
  const [isExpiryComplete, setIsExpiryComplete] = useState(false);
  const [isCvcComplete, setIsCvcComplete] = useState(false);

  useEffect(() => {
    setIsCardComplete(isCardNumberComplete && isExpiryComplete && isCvcComplete && owner.trim() !== "");
  }, [isCardNumberComplete, isExpiryComplete, isCvcComplete, owner, setIsCardComplete]);

  // expose ฟังก์ชันจ่ายเงินผ่าน ref
  useImperativeHandle(ref, () => ({
    async pay() {
      if (!stripe || !elements) return { error: "Stripe ยังไม่พร้อม" };
      const amount = booking?.total;
      const bookingIdReal = booking?.id;
      const movieId = booking?.movie_id;
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, userId, bookingId: bookingIdReal, movieId }),
        });
        const { clientSecret } = await res.json();
        console.log('clientSecret', clientSecret);
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) return { error: "กรุณากรอกข้อมูลบัตรให้ครบถ้วน" };
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardNumberElement,
            billing_details: { name: owner },
          },
        });
        console.log('confirmError', confirmError, 'paymentIntent', paymentIntent);
        if (confirmError) return { error: confirmError.message };
        const paymentData = {
          payment_intent_id: paymentIntent.id,
          amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          payment_method: "card",
          payment_details: paymentIntent,
          user_id: userId,
          booking_id: bookingIdReal
        };
        const { data, error: supaError } = await supabase
          .from('movie_payments')
          .insert([paymentData]);
        console.log('supabase insert', data, supaError);
        if (supaError) return { error: "บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ: " + supaError.message };
        return { success: true };
      } catch (err) {
        console.log('catch error', err);
        return { error: "เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง" };
      }
    }
  }));

  return (
    <form className="px-4 mt-4 md:mt-0 space-y-4" onSubmit={e => e.preventDefault()}>
      <div className="md:flex md:space-x-4">
        <div className="md:flex-1">
          <label className="block body-2-regular text-base-gray-400 mb-1">Card number</label>
          <CardNumberElement
            options={ELEMENT_OPTIONS}
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-[4px] px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
            onChange={(e) => setIsCardNumberComplete(e.complete)}
          />
        </div>
        <div className="md:flex-1 mt-4 md:mt-0">
          <label className="block body-2-regular text-base-gray-400 mb-1">Card owner</label>
          <input
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
            placeholder="Card owner name"
            value={owner}
            onChange={e => setOwner(e.target.value)}
          />
        </div>
      </div>
      <div className="md:flex md:space-x-4">
        <div className="md:flex-1">
          <label className="block body-2-regular text-base-gray-400 mb-1">Expiry date</label>
          <CardExpiryElement
            options={ELEMENT_OPTIONS}
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
            onChange={(e) => setIsExpiryComplete(e.complete)}
          />
        </div>
        <div className="md:flex-1 mt-4 md:mt-0">
          <label className="block body-2-regular text-base-gray-400 mb-1">CVC</label>
          <CardCvcElement
            options={ELEMENT_OPTIONS}
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
            onChange={(e) => setIsCvcComplete(e.complete)}
          />
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
      const res = await fetch('/api/create-promptpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch('/api/check-promptpay-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
    if (qrStatus === 'successful' && chargeId && !saved) {
      const saveToSupabase = async () => {
        const mockUserId = "00000000-0000-0000-0000-000000000001";
        const mockBookingId = "11111111-1111-1111-1111-111111111111";
        const mockMovieId = "22222222-2222-2222-2222-222222222222";
        const mockAmount = 299;
        // ดึงข้อมูล charge จาก Omise API (ผ่าน API server)
        const res = await fetch('/api/check-promptpay-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chargeId }),
        });
        const data = await res.json();
        // บันทึกลง Supabase
        const { data: supaData, error: supaError } = await supabase
          .from('movie_payments')
          .insert([{
            payment_intent_id: chargeId,
            amount: mockAmount,
            currency: 'thb',
            status: 'successful',
            payment_method: "promptpay",
            payment_details: data, // หรือ data.charge
            user_id: mockUserId,
            booking_id: mockBookingId,
            movie_id: mockMovieId,
          }]);
        if (supaError) {
          alert('บันทึกข้อมูลไม่สำเร็จ: ' + supaError.message);
        } else {
          alert('บันทึกข้อมูลสำเร็จ!');
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
          {qrLoading ? 'กำลังสร้าง QR...' : 'สร้าง QR PromptPay'}
        </button>
        {qrError && <div className="text-red-500 mt-2">{qrError}</div>}
      </>
    );
  }
  return (
    <>
      <img src={qrUrl} alt="PromptPay QR" width={180} height={180} />
      <div className="mt-2 text-xs text-center w-full text-white">สแกน QR ด้วยแอปธนาคารเพื่อชำระเงิน</div>
      <div className="mt-2 text-xs text-center w-full text-white">สถานะ: {qrStatus}</div>
    </>
  );
}

export default function PaymentMobile() {
  const router = useRouter();
  const [tab, setTab] = useState("credit");
  const [card, setCard] = useState({
    number: "",
    owner: "",
    expiry: "",
    cvc: "",
  });
  const expiryInputRef = useRef(null);
  const [openCouponPopup, setOpenCouponPopup] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const movie_id = "013b897b-3387-4b7f-ab23-45b78199020a";
  const { movie, genres, languages, showtime, hall, cinema, loading } = useMovieDetail(movie_id);
  const userId = "mock-user-id"; // TODO: เปลี่ยนเป็น user id จริง
  const { couponsInWallet, loading: loadingCoupons } = useCouponWallet(userId);
  const selectedCoupon = couponsInWallet.find(c => c.coupons.coupon_id === selectedCouponId);

  // ฟังก์ชันเมื่อกด Next
  const handleNext = (e) => {
    e.preventDefault();
    if (tab === 'credit' && !isCardComplete) return;
    setOpenConfirmPopup(true);
  };

  // ฟังก์ชันจ่ายเงินจริงเมื่อกด Confirm
  const handleConfirmPayment = async () => {
    setConfirmLoading(true);
    setConfirmError(null);
    if (cardFormRef.current && cardFormRef.current.pay) {
      const result = await cardFormRef.current.pay();
      if (result.success) {
        setConfirmLoading(false);
        setOpenConfirmPopup(false);
        router.push(`/payment-success?bookingId=${booking?.id}`);
      } else {
        setConfirmError(result.error || 'เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง');
        setConfirmLoading(false);
      }
    } else {
      setConfirmError('ไม่สามารถดำเนินการชำระเงินได้');
      setConfirmLoading(false);
    }
  };

  // ฟังก์ชันเมื่อกด Confirm ใน QR Tab
  const handleConfirmQR = async () => {
    setConfirmLoading(true);
    setQrError(null);
    try {
      const res = await fetch('/api/create-promptpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: booking?.total * 100 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQrUrl(data.qr);
      setChargeId(data.chargeId);
      setQrStatus(data.status);
      setOpenConfirmPopup(false);
      router.push(`/payment-qr?chargeId=${data.chargeId}&amount=${booking?.total}&bookingId=${booking?.id}`);
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
        const res = await fetch('/api/check-promptpay-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chargeId }),
        });
        const data = await res.json();
        setQrStatus(data.status);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [chargeId]);

  if (loading) return <div>Loading...</div>;
  // ไม่ต้อง return ถ้า booking เป็น null ให้แสดงฟอร์มด้วย mock data

  // mock data สำหรับ fallback
  const mockBooking = {
    movie_title: "The Dark Knight",
    genres: ["Action", "Crime", "TH"],
    movie_poster: "https://res.cloudinary.com/dr2ijid6r/image/upload/v1746026694/How_to_Train_Your_Dragon_ei5n5w.jpg",
    cinema_name: "Minor Cineplex Arkham",
    show_date: "24 Jun 2024",
    show_time: "16:30",
    hall: "Hall 1",
    languages: ["TH", "EN"],
    coupon_name: "Merry March Magic – Get 50 THB Off! (Only in March)",
    coupon_discount: 50,
    seat: ["C9", "C10"],
    payment_method: "Credit card",
    total: 330,
  };

  // ถ้า booking มีข้อมูลจริง ให้ map field ให้ตรงกับ props และแปลง string เป็น array ถ้าจำเป็น
  const data = booking
    ? {
        ...booking,
        genres: typeof booking.genres === 'string' ? JSON.parse(booking.genres) : booking.genres,
        languages: typeof booking.languages === 'string' ? JSON.parse(booking.languages) : booking.languages,
        seat: typeof booking.seat === 'string' ? JSON.parse(booking.seat) : booking.seat,
      }
    : mockBooking;

  return (
    <div className="bg-background w-screen min-h-screen text-white font-sans overflow-x-hidden flex flex-col md:items-start md:justify-center">
      <div className="w-full">
        {/* <Navbar /> */}
      </div>
      {/* Stepper */}
     {/*  <div className="w-full">
        <div className="hidden md:flex bg-base-gray-0 justify-start mt-[80px]">
          <div className="w-full max-w-[1200px] mx-auto md:mr-[200px] ">
            <div className="h-[106px] w-full max-w-[600px] flex flex-col justify-center items-center relative mx-auto">
              <div className="absolute left-0 right-0 top-[36%] transform -translate-y-1/2 h-px bg-[#21263F] z-0 mx-[80px]" />
              <div className="flex justify-between items-center w-full px-[46px] z-10">
                <div className="flex flex-col items-center">
                  <div className="w-[44px] h-[44px] rounded-full bg-brand-blue-200 flex items-center justify-center text-white text-bold">
                    <CheckIcon />
                  </div>
                  <span className="body-2-regular mt-2">Select showtime</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-[44px] h-[44px] rounded-full bg-brand-blue-200 flex items-center justify-center text-white text-bold">
                    <CheckIcon />
                  </div>
                  <span className="body-2-regular mt-2">Select seat</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#3B82F6] flex items-center justify-center text-white headline-4">3</div>
                  <span className="body-2-regular mt-2">Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex md:hidden justify-center bg-base-gray-0 mt-[50px] relative">
          <div className="h-[106px] w-full max-w-[600px] flex flex-col justify-center items-center relative">
            <div className="absolute left-0 right-0 top-[36%] transform -translate-y-1/2 h-px bg-[#21263F] z-0 mx-[80px]" />
            <div className="flex justify-between items-center w-full px-[46px] z-10">
              <div className="flex flex-col items-center">
                <div className="w-[44px] h-[44px] rounded-full bg-brand-blue-200 flex items-center justify-center text-white text-bold">
                  <CheckIcon />
                </div>
                <span className="body-2-regular mt-2">Select showtime</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[44px] h-[44px] rounded-full bg-brand-blue-200 flex items-center justify-center text-white text-bold">
                  <CheckIcon />
                </div>
                <span className="body-2-regular mt-2">Select seat</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[44px] h-[44px] rounded-full bg-[#3B82F6] flex items-center justify-center text-white headline-4">3</div>
                <span className="body-2-regular mt-2">Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <div className="flex flex-col md:flex-row justify-between items-start w-full max-w-[1200px] mx-auto md:mt-[100px]">
        {/* ฝั่งซ้าย: ฟอร์ม */}
        <div className="w-full md:w-[600px] md:ml-[-60px]">
          {/* Tab */}
          <div className="flex mt-[50px] md:mt-[-30px] gap-4 items-baseline ml-4 md:ml-4">
            <button
              className="flex justify-center md:mb-[50px]"
              onClick={() => setTab('credit')}
            >
              <span
                className={`headline-3 pb-1 px-[7px] inline-block ${tab === 'credit' ? 'border-b-[1px] border-[#565F7E] text-white' : 'border-b-0 text-[#8B93B0]'}`}
              >
                Credit card
              </span>
            </button>
            <button
              className="flex justify-center md:ml-8"
              onClick={() => setTab('qr')}
            >
              <span
                className={`headline-3 pb-1 px-[7px] inline-block ${tab === 'qr' ? 'border-b-[1px] border-[#565F7E] text-white' : 'border-b-0 text-[#8B93B0]'}`}
              >
                QR Code
              </span>
            </button>
          </div>

          {/* Credit Card Form */}
          {tab === "credit" && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                ref={cardFormRef}
                setIsCardComplete={setIsCardComplete}
                booking={booking}
                userId={userId}
              />
            </Elements>
          )}

          {/* QR Code Tab */}
          {tab === "qr" && (
            <div className="px-4 mt-4 flex flex-col items-center text-gray-400 w-full md:ml-[120px]">
              {/* ถ้ายังไม่มี qrUrl ให้แสดงปุ่ม Next -> Confirm -> สร้าง QR */}
              {!qrUrl ? (
                <>
                  <div className="bg-[#232B47] rounded py-10 md:w-[793px] md:h-[104px] flex items-center justify-center w-full flex-col">
                    <span className="text-white">QR Code Payment</span>
                    {qrError && <div className="text-red-500 mt-2">{qrError}</div>}
                  </div>
                  <div className="mt-2 text-xs text-center w-full">Scan QR code to pay</div>
                </>
              ) : (
                <div className="bg-[#232B47] rounded py-10 md:w-[793px] flex flex-col items-center justify-center w-full">
                  <img src={qrUrl} alt="PromptPay QR" width={180} height={180} />
                  <div className="mt-4 text-white font-bold text-lg">Minor Cineplex Public limited company</div>
                  <div className="mt-2 text-white font-bold text-xl">THB{(booking?.total || 0).toLocaleString()}</div>
                  <div className="mt-2 text-xs text-center w-full text-white">{qrStatus && `สถานะ: ${qrStatus}`}</div>
                </div>
              )}
            </div>
          )}
        </div>
        
        
      {/*   <div className="flex flex-col items-center gap-0 w-full mt-8 md:w-auto md:mt-[-30px] px-0">
          <div className="w-full">
            <MovieInfoCard
              title={movie.title}
              genres={genres}
              image={movie.poster_url}
              cinema={cinema?.name}
              date={showtime?.date}
              time={showtime?.start_time}
              hall={hall?.screen_number}
            />
          ) : (
            <div className="text-red-400 text-center">ไม่พบข้อมูลหนัง</div>
          )}
        </div>
        <div className="px-4 md:px-0 mt-0">
          <CouponDiscount 
            coupon={selectedCoupon?.coupons?.title || "Not Found Coupon"}
            onRemove={() => setSelectedCouponId(null)}
            onSelectCoupon={() => setOpenCouponPopup(true)}
          />
        </div>
        <div className="px-4 md:px-0 mt-0">
          <SumPaymentDiscount
            seats={Array.isArray(movie?.seats) ? movie.seats : ["C9", "C10"]}
            paymentMethod={tab === 'credit' ? 'Credit card' : 'QR Code'}
            coupon={selectedCoupon ? { label: '-THB50', color: 'text-brand-red' } : null}
            total={movie?.total || "THB300"}
            onNext={handleNext}
          />
        </div>
      </div>
      {/* mount popup confirm */}
      <ConfirmBookingPopup
        open={openConfirmPopup}
        onClose={() => setOpenConfirmPopup(false)}
        onConfirm={tab === 'qr' ? handleConfirmQR : handleConfirmPayment}
        loading={confirmLoading}
        error={confirmError || qrError}
      />
    </div>
  );
}