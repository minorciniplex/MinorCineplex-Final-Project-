import BookingCard from "@/components/Booking/BookingCard";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar/Navbar";
import StepProgressBar from "@/components/Booking/StepProgressBar";
import { useStatus } from "@/context/StatusContext";
import BookingSeats from "@/components/Booking/BookingSeats";

export default function Seats() {
  const router = useRouter();
  const {
    time,
    screenNumber,
    cinemaName,
    poster,
    title,
    date,
    showtimeId,
    movieId,
    price,
  } = router.query;
  const [genres, setGenres] = useState(null);
  const [language, setLanguage] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const { isLoggedIn } = useStatus();

  // Use useCallback to prevent functions from changing on every render
  const handleSeatsChange = useCallback((seatsData) => {
    setSelectedSeats(seatsData.seats);
    console.log("Selected seats:", seatsData.seats); // Debug log
  }, []);

  const handlePriceChange = useCallback((price) => {
    setTotalPrice(price);
    // console.log("Total price:", price); // Debug log
  }, []);


  useEffect(() => {
    if (router.isReady) {
      const { genres, language } = router.query;
      setGenres(JSON.parse(genres));
      setLanguage(JSON.parse(language));
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <Navbar />
      <StepProgressBar />
      <div className="flex flex-col sm:flex-row justify-center sm:py-[80px] sm:px-[120px] sm:gap-[102px]">
        <BookingSeats
          showtimeId={showtimeId}
          onSeatsChange={handleSeatsChange}
          onPriceChange={handlePriceChange}
          price={price}
        />
        <BookingCard
        className="py-10 px-4"
        time={time}
        cinemaName={cinemaName}
        screenNumber={screenNumber}
        poster={poster}
        title={title}
        genres={genres}
        language={language}
        date={date}
        seat={selectedSeats}
        price={totalPrice}
        showtimes={showtimeId}
        movieId={movieId}
      />
      


      </div>
    </>
  );
}
