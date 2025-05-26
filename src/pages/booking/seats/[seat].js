import BookingCard from "@/components/Booking/BookingCard";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import BookingSeats from "@/components/Booking/BookingSeats";
import StepProgressBar from "@/components/Booking/StepProgressBar";


export default function Seats() {
  const router = useRouter();
  const { time, screenNumber, cinemaName, poster, title, date, showtimes, movieId } = router.query;
  const [genres, setGenres] = useState(null);
  const [language, setLanguage] = useState(null);
  const [bookingSeat, setBookingSeat] = useState([]);
  const [sumPrice, setSumPrice] = useState(0);


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
      <div className="flex flex-col sm:flex-row justify-center sm:py-[80px] sm:px-[120px] sm:gap-[102px]">
        <BookingSeats setBookingSeat={setBookingSeat} setSumPrice={setSumPrice} />
      <BookingCard
        time={time}
        cinemaName={cinemaName}
        screenNumber={screenNumber}
        poster={poster}
        title={title}
        genres={genres}
        language={language}
        date={date}
        seat={bookingSeat}
        price={sumPrice}
        showtimes={showtimes}
        movieId={movieId}
      />
      <p>{showtimes}</p>
      </div>
      

    </>
  );
}
