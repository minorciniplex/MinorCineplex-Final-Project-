import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { createClient } from '@supabase/supabase-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function MyCustomCardForm({ amount, userId, bookingId, movieId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe ยังโหลดไม่เสร็จ กรุณารอสักครู่");
      return;
    }
    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setError("กรุณากรอกข้อมูลบัตรให้ครบถ้วน");
      return;
    }

    setProcessing(true);

    // 1. สร้าง PaymentIntent
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const { clientSecret } = await res.json();

    // 2. ยืนยันการชำระเงิน
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberElement,
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    // 3. Log ข้อมูลก่อน insert
    console.log("Insert to Supabase", {
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_method: "card",
      payment_details: paymentIntent,
      user_id: userId || null,
      booking_id: bookingId || null,
      movie_id: movieId || null,
    });

    // 4. บันทึกข้อมูลธุรกรรมลง Supabase ให้ตรงกับตาราง movie_payments
    const { data, error: supaError } = await supabase
      .from('movie_payments')
      .insert([{
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_method: "card",
        payment_details: paymentIntent,
        user_id: userId || null,
        booking_id: bookingId || null,
        movie_id: movieId || null,
      }]);

    // 5. Log ผลลัพธ์หลัง insert
    console.log("Supabase insert result", { data, supaError });

    if (supaError) {
      setError("บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ: " + supaError.message);
      console.error("Supabase error:", supaError);
      setProcessing(false);
      return;
    }

    setProcessing(false);
    onSuccess(paymentIntent);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Card number</label>
        <CardNumberElement options={{ style: { base: { fontSize: "16px" } } }} className="p-2 border rounded w-full" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Expiry date</label>
        <CardExpiryElement options={{ style: { base: { fontSize: "16px" } } }} className="p-2 border rounded w-full" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">CVC</label>
        <CardCvcElement options={{ style: { base: { fontSize: "16px" } } }} className="p-2 border rounded w-full" />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button type="submit" disabled={processing || !stripe || !elements} className="w-full bg-brand-blue text-white py-2 rounded">
        {processing ? "กำลังชำระเงิน..." : "ชำระเงิน"}
      </button>
    </form>
  );
}

export default function CustomStripeForm({ amount, userId, bookingId, movieId, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <MyCustomCardForm amount={amount} userId={userId} bookingId={bookingId} movieId={movieId} onSuccess={onSuccess} />
    </Elements>
  );
}