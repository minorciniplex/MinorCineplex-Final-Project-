import BookingCard from "@/components/Booking/BookingCard";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";

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
    </>
  );
}
