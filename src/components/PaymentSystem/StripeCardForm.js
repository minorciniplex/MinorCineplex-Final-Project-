import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/utils/supabase";

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
};

const StripeCardForm = forwardRef(function StripeCardForm(
  { setIsCardComplete, booking, userId, couponId },
  ref
) {
  const stripe = useStripe();
  const elements = useElements();
  const [owner, setOwner] = useState("");
  const [isCardNumberComplete, setIsCardNumberComplete] = useState(false);
  const [isExpiryComplete, setIsExpiryComplete] = useState(false);
  const [isCvcComplete, setIsCvcComplete] = useState(false);

  useEffect(() => {
    if (setIsCardComplete) {
      setIsCardComplete(
        isCardNumberComplete &&
          isExpiryComplete &&
          isCvcComplete &&
          owner.trim() !== ""
      );
    }
  }, [
    isCardNumberComplete,
    isExpiryComplete,
    isCvcComplete,
    owner,
    setIsCardComplete,
  ]);

  useImperativeHandle(ref, () => ({
    async pay() {
      let amount = booking?.total;
      if (typeof amount === "string") {
        amount = Number(amount.replace(/,/g, ""));
      }
      amount = Number(amount);
      if (!amount || isNaN(amount)) {
        return { error: "Invalid amount" };
      }
      if (!stripe || !elements) return { error: "Stripe not ready" };
      const bookingIdReal = booking?.id;
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
        if (!paymentIntent) {
          return { error: "Unable to create paymentIntent" };
        }
        if (paymentIntent.status !== "succeeded") {
          return { error: "Payment failed. Please try again" };
        }
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
        // เรียก mark-paid หลังจ่ายเงินสำเร็จ
        const markPaidRes = await fetch("/api/booking/mark-paid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: bookingIdReal, couponId }),
        });
        const markPaidData = await markPaidRes.json();
        if (!markPaidData.success) {
          return { error: "Failed to update booking: " + (markPaidData.error || "") };
        }
        return { success: true };
      } catch (err) {
        return { error: "Payment error occurred. Please try again" };
      }
    },
  }));

  return (
    <form
      className="px-4 mb-10 sm:mb-0 space-y-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="md:flex md:space-x-4">
        <div className="md:flex-1">
          <label className="block body-2-regular text-base-gray-400 mb-1">
            Card number
          </label>
          <CardNumberElement
            options={ELEMENT_OPTIONS}
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-[4px] pl-4 py-3 pr-3 text-base placeholder-base-gray-300 outline-none"
            onChange={(e) => setIsCardNumberComplete(e.complete)}
          />
        </div>
        <div className="md:flex-1 mt-4 md:mt-0">
          <label className="block body-2-regular text-base-gray-400 mb-1">
            Card owner
          </label>
          <input
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md pl-4 py-3 pr-3 text-base placeholder-base-gray-300 outline-none"
            placeholder="Card owner name"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
        </div>
      </div>
      <div className="md:flex md:space-x-4 items-center">
        <div className="md:flex-1">
          <label className="block body-2-regular text-base-gray-400 mb-1">
            Expiry date
          </label>
          <CardExpiryElement
            options={ELEMENT_OPTIONS}
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md pl-4 py-3 pr-3 text-base placeholder-base-gray-300 outline-none"
            onChange={(e) => setIsExpiryComplete(e.complete)}
          />
        </div>
        <div className="md:flex-1 mt-4 md:mt-0">
          <label className="block body-2-regular text-base-gray-400 mb-1">
            CVC
          </label>
          <CardCvcElement
            options={ELEMENT_OPTIONS}
            className="w-[343px] md:w-[384.5px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md pl-4 py-3 pr-3 text-base placeholder-base-gray-300 outline-none"
            onChange={(e) => setIsCvcComplete(e.complete)}
          />
        </div>
      </div>
    </form>
  );
});

export default StripeCardForm; 