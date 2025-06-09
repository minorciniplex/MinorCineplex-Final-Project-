import BookingCard from "@/components/Booking/BookingCard";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar/Navbar";
import StepProgressBar from "@/components/Booking/StepProgressBar";
import { useStatus } from "@/context/StatusContext";
import BookingSeats from "@/components/Booking/BookingSeats";
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
    showtimeId,
    movieId,
    price,
    friendSeats: friendSeatsQuery,
  } = router.query;
  const [genres, setGenres] = useState(null);
  const [language, setLanguage] = useState(null);
  const [friendSeats, setFriendSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const { isLoggedIn } = useStatus();
  const [existingBookingId, setExistingBookingId] = useState(null);

  // Use useCallback to prevent functions from changing on every render
  const handleSeatsChange = useCallback((seatsData) => {
    setSelectedSeats(seatsData.seats);
  }, []);

  const handlePriceChange = useCallback((price) => {
    setTotalPrice(price);
  }, []);

  const handleExistingBookingIdChange = useCallback((bookingId) => {
    setExistingBookingId(bookingId);
    console.log("existingBookingId:", bookingId);
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const {
        genres,
        language,
        friendSeats: friendSeatsFromQuery,
      } = router.query;
      // Use safe JSON parsing helper
      setGenres(parseQueryParam(router.query, 'genres', null));
      setLanguage(parseQueryParam(router.query, 'language', null));

      if (friendSeatsFromQuery) {
        try {
          const parsedFriendSeats = JSON.parse(friendSeatsFromQuery);
          setFriendSeats(
            Array.isArray(parsedFriendSeats) ? parsedFriendSeats : []
          );
        } catch (error) {
          console.error("Error parsing friendSeats:", error);
          setFriendSeats([]);
        }
      } else {
        setFriendSeats([]);
      }
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <Navbar />
      <StepProgressBar />
      <div className="flex flex-col md:flex-row justify-center md:py-[80px] md:px-[120px] md:gap-[102px] mt-20 sm:mt-0">
        <BookingSeats
          showtimeId={showtimeId}
          price={price}
          onSeatsChange={handleSeatsChange}
          onPriceChange={handlePriceChange}
          onBookingIdChange={handleExistingBookingIdChange}
          friendSeats={["A1", "A2"]}
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
          existingBookingId={existingBookingId}
        />
      </div>
    </>
  );
}
