import BookingCard from "@/components/Booking/BookingCard";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import StepProgressBar from "@/components/Booking/StepProgressBar";
import SeatLayout from "@/components/Booking/SeatLayout";

export default function Seats() {
  const router = useRouter();
  const { time, screenNumber, cinemaName, poster, title, date } = router.query;
  const [genres, setGenres] = useState(null);
  const [language, setLanguage] = useState(null);

  useEffect(() => {
    if (router.isReady) {
      const { genres, language } = router.query;

      setGenres(JSON.parse(genres));
      setLanguage(JSON.parse(language));
    }
  }, [router.isReady]);

  return (
    <>
      <Navbar />
      <StepProgressBar />
      <div className="flex flex-row sm:py-20 sm:px-[120px] gap-[102px]">
        <SeatLayout />
        <BookingCard
          time={time}
          cinemaName={cinemaName}
          screenNumber={screenNumber}
          poster={poster}
          title={title}
          genres={genres}
          language={language}
          date={date}
        />
      </div>
    </>
  );
}
