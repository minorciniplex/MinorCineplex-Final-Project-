import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import PaymentsCard from "@/components/Booking/PaymentsCard";
import PaymentMobile from "@/components/PaymentSystem/PaymentMobile";
import StepProgressBar from "@/components/Booking/StepProgressBar";
import useBookingSeat from "@/hooks/useBookingSeat";

export default function Seats() {
  const router = useRouter();
  const { time, screenNumber, cinemaName, poster, title, date, seat, price, showtimes, bookingId } = router.query;
  const [genres, setGenres] = useState(null);
  const [language, setLanguage] = useState(null);
  const [seatNumber, setSeatNumber] = useState(null);
  const { processPayment,
    isLoading,
    error,
    resetPaymentState } = useBookingSeat();

  

  useEffect(() => {
    if (router.isReady) {
      const { genres, language, seat } = router.query;
      setGenres(JSON.parse(genres));
      setLanguage(JSON.parse(language));
      setSeatNumber(JSON.parse(seat));

    }
  }, [router.isReady]);

  console.log(seatNumber, showtimes, bookingId, price);

  const handlePayment = async () => {
    const paymentData = {
      showtimeId: showtimes,
      seatNumber: seatNumber,
      sumPrice: price,
      bookingId: bookingId
    };

    const result = await processPayment(paymentData);

    if (result.success) {
      // Handle successful payment
      console.log("Booking confirmed:", result.data);
      // Redirect to confirmation page or update UI
    } else {
      // Handle payment failure
      console.error("Payment failed:", result.error);
    }
  }


  return (
    <>
      <Navbar />
      <StepProgressBar currentPath="/booking/payment" />
      <div className="">
        <div className="flex flex-row justify-between items-start gap-4 p-4">
          <PaymentMobile />
          <PaymentsCard
            time={time}
            cinemaName={cinemaName}
            screenNumber={screenNumber}
            poster={poster}
            title={title}
            genres={genres}
            language={language}
            date={date}
            seatNumber={seat}
            bookingId={bookingId}
            showtimes={showtimes}
          />
        </div>
        <button className="w-full bg-[--base-gray-0] text-[--base-gray-900] p-4 rounded-lg shadow-md hover:bg-[--base-gray-100] transition-colors duration-200"
        disabled={isLoading}
        onClick={handlePayment}
        >
          payment
        </button>
      </div>
    </>
  );
}
