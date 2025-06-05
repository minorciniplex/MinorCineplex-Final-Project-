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

  useEffect(() => {
    if (router.isReady) {
      const { genres, language, seat } = router.query;
      setGenres(JSON.parse(genres));
      setLanguage(JSON.parse(language));
      setSeatNumber(JSON.parse(seat));
    }
  }, [router.isReady]);

  return (
    <>
      <Navbar />
      <StepProgressBar currentPath="/booking/payment" />
      <div className="flex flex-col md:flex-row justify-center md:py-[80px] md:px-[120px] md:gap-[102px]">
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
    </>
  );
}
