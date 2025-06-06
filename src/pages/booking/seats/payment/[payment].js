import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import PaymentsCard from "@/components/Booking/PaymentsCard";
import PaymentMobile from "@/components/PaymentSystem/PaymentMobile";
import StepProgressBar from "@/components/Booking/StepProgressBar";
import useBookingSeat from "@/hooks/useBookingSeat";

export default function Seats() {
  const router = useRouter();
  const {
    time,
    screenNumber,
    cinemaName,
    poster,
    title,
    date,
    seat,
    price,
    showtimes,
    bookingId,
  } = router.query;
  const [genres, setGenres] = useState(null);
  const [language, setLanguage] = useState(null);
  const [seatNumber, setSeatNumber] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Credit card");
  const { processPayment, resetPaymentState } = useBookingSeat();

  useEffect(() => {
    if (router.isReady) {
      const { genres, language, seat } = router.query;
      setGenres(JSON.parse(genres));
      setLanguage(JSON.parse(language));
      setSeatNumber(JSON.parse(seat));
    }
  }, [router.isReady]);

    const handlePayment = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    resetPaymentState();


    const result = await processPayment({
      showtimeId : showtimes,
      seatNumber,
      sumPrice : price,
      bookingId,
    });

    if (result.success) {
      alert('Payment successful!');
      // Redirect to success page or show success message
    } else {
      alert(`Payment failed: ${result.error}`);
    }
  };





  return (
    <>
      <Navbar />
      <StepProgressBar currentPath="/booking/payment" />
      <div className="flex flex-col sm:flex-row justify-center sm:py-[80px] sm:px-[120px] sm:gap-[102px]">
        <PaymentMobile setPaymentMethod={setPaymentMethod} />
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
          paymentMethod={paymentMethod}
        />
      </div>
      <div className="flex justify-center mt-8">
        <button
          onClick={handlePayment}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Confirm Payment
        </button>
      </div>
    </>
  );
}
