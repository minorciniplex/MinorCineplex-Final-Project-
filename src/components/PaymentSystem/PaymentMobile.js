import React, { useState, useRef } from "react";
import Navbar from "../Navbar/Navbar";
import CheckIcon from '@mui/icons-material/Check';
import Image from 'next/image';
import MovieInfoCard from "./MovieInfoCard";
import { useMovieDetail } from '@/hooks/useMovieDetail';
import SumPaymentDiscount from './SumPaymentDiscount';
import CouponDiscount from './CouponDiscount';
import { useMyCoupons } from '@/hooks/useMyCoupons';
import CouponSelectPopup from './CouponSelectPopup';
import { loadStripe } from "@stripe/stripe-js";
import { createClient } from '@supabase/supabase-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#fff",
      backgroundColor: "#232B47",
      border: "1px solid #232B47",
      borderRadius: "4px",
      padding: "12px",
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

function StripeCardForm({ processing, error, setError, setProcessing, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [owner, setOwner] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) return;
    setProcessing(true);
    // Mock ข้อมูล
    const mockUserId = "00000000-0000-0000-0000-000000000001";
    const mockBookingId = "11111111-1111-1111-1111-111111111111";
    const mockMovieId = "22222222-2222-2222-2222-222222222222";
    const mockAmount = 299;
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: mockAmount }),
      });
      const { clientSecret } = await res.json();
      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);
      if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
        setError("กรุณากรอกข้อมูลบัตรให้ครบถ้วน");
        setProcessing(false);
        return;
      }
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { name: owner },
        },
      });
      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
        return;
      }
      // บันทึกข้อมูลลง Supabase
      const { data, error: supaError } = await supabase
        .from('movie_payments')
        .insert([{
          payment_intent_id: paymentIntent.id,
          amount: mockAmount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          payment_method: "card",
          payment_details: paymentIntent,
          user_id: mockUserId,
          booking_id: mockBookingId,
          movie_id: mockMovieId,
        }]);
      if (supaError) {
        setError("บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ: " + supaError.message);
        setProcessing(false);
        return;
      }
      setProcessing(false);
      alert("ชำระเงินสำเร็จ!");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง");
      setProcessing(false);
    }
  };

  return (
    <form className="px-4 mt-4 md:mt-0 space-y-4" onSubmit={handleSubmit}>
      <div className="md:flex md:space-x-4">
        <div className="md:flex-1">
          <label className="block body-2-regular text-base-gray-400 mb-1">Card number</label>
          <CardNumberElement
            options={ELEMENT_OPTIONS}
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-[4px] px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
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
          />
        </div>
        <div className="md:flex-1 mt-4 md:mt-0">
          <label className="block body-2-regular text-base-gray-400 mb-1">CVC</label>
          <CardCvcElement
            options={ELEMENT_OPTIONS}
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
          />
        </div>
      </div>
      {error && <div className="px-4 mt-2 text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={processing}
        className="w-full py-2 rounded mt-2 bg-brand-blue-200 text-white"
      >
        {processing ? "กำลังประมวลผล..." : "จ่ายเงิน"}
      </button>
    </form>
  );
}

export default function PaymentMobile() {
  const [tab, setTab] = useState("credit");
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

  // ตัวอย่าง movie_id (ควรรับจาก prop, route, หรือ context จริง)
  const movie_id = "013b897b-3387-4b7f-ab23-45b78199020a";
  const { movie, genres, languages, showtime, hall, cinema, loading } = useMovieDetail(movie_id);
  const userId = "mock-user-id"; // TODO: เปลี่ยนเป็น user id จริง
  const { coupons, loading: loadingCoupons } = useMyCoupons(userId);

  // ฟังก์ชันเมื่อกด Next
  const handleNext = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // Mock ข้อมูล
    const mockUserId = "00000000-0000-0000-0000-000000000001";
    const mockBookingId = "11111111-1111-1111-1111-111111111111";
    const mockMovieId = "22222222-2222-2222-2222-222222222222";
    const mockAmount = 199;

    try {
      const stripe = await stripePromise;
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: mockAmount }),
      });
      const { clientSecret } = await res.json();

      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: "card",
        card: {
          number: card.number,
          exp_month: card.expiry.split("/")[0],
          exp_year: card.expiry.split("/")[1],
          cvc: card.cvc,
        },
      });
      if (pmError) {
        setError(pmError.message);
        setProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });
      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
        return;
      }

      // บันทึกข้อมูลลง Supabase
      const { data, error: supaError } = await supabase
        .from('movie_payments')
        .insert([{
          payment_intent_id: paymentIntent.id,
          amount: mockAmount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          payment_method: "card",
          payment_details: paymentIntent,
          user_id: mockUserId,
          booking_id: mockBookingId,
          movie_id: mockMovieId,
        }]);
      if (supaError) {
        setError("บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ: " + supaError.message);
        setProcessing(false);
        return;
      }

      setProcessing(false);
      alert("ชำระเงินสำเร็จ!");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง");
      setProcessing(false);
    }
  };

  return (
    <div className="bg-background w-screen min-h-screen text-white font-sans overflow-x-hidden flex flex-col md:items-start md:justify-center">
      <div className="w-full">
        <Navbar />
      </div>
      {/* Stepper */}
      <div className="w-full">
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
      </div>
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
                processing={processing}
                error={error}
                setError={setError}
                setProcessing={setProcessing}
              />
            </Elements>
          )}

          {/* QR Code Tab */}
          {tab === "qr" && (
            <div className="px-4 mt-4 flex flex-col items-center text-gray-400 w-full md:ml-[120px]">
              <div className="bg-[#232B47] rounded py-10 md:w-[793px] md:h-[104px] flex items-center justify-center w-full">
                QR Code Payment
              </div>
              <div className="mt-2 text-xs text-center w-full">
                Scan QR code to pay
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-0 w-full mt-8 md:w-auto md:mt-[-30px] px-0">
          <div className="w-full">
            <MovieInfoCard />
            <CouponDiscount onSelectCoupon={() => setOpenCouponPopup(true)} />
            {openCouponPopup && (
              <CouponSelectPopup open={openCouponPopup} onClose={() => setOpenCouponPopup(false)} coupons={coupons} onApply={setSelectedCoupon} />
            )}
            <SumPaymentDiscount disabled={tab !== 'qr' && (!card.number || !card.owner || !card.expiry || !card.cvc)} />
          </div>
        </div>
      </div>
    </div>
  );
}