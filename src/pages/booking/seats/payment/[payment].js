import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import PaymentsCard from "@/components/Booking/PaymentsCard";
import PaymentMobile from "@/components/PaymentSystem/PaymentMobile";
import StepProgressBar from "@/components/Booking/StepProgressBar";
import useBookingSeat from "@/hooks/useBookingSeat";
import { PaymentProvider } from "@/context/PaymentContext";
import { parseQueryParam } from "@/utils/jsonHelper";

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
  const [isCardComplete, setIsCardComplete] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      // Use safe JSON parsing helper
      setGenres(parseQueryParam(router.query, 'genres', null));
      setLanguage(parseQueryParam(router.query, 'language', null));
      setSeatNumber(parseQueryParam(router.query, 'seat', null));
    }
  }, [router.isReady]);


  return (
    <>
      <Navbar />
      <StepProgressBar currentPath="/booking/payment" />
      <PaymentProvider>
        <div className="flex flex-col sm:flex-row justify-center sm:py-[80px] sm:px-[120px] sm:gap-[102px]">
          <PaymentMobile setPaymentMethod={setPaymentMethod} isCardComplete={isCardComplete} setIsCardComplete={setIsCardComplete} />
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
            isCardComplete={isCardComplete}
          />
        </div>
      </PaymentProvider>
    </>
  );
}
