import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Head from "next/head";
import axios from "axios";
import Navbar from "@/components/Navbar/Navbar";
import Image from "next/image";

export default function BookingDetailPage() {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(booking);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `/api/booking/booking-history-for-share?booking_id=${bookingId}`
        );
        if (response.data.data) {
          setBooking(response.data.data);
        } else {
          setError("ไม่พบข้อมูลการจอง");
        }
      } catch (error) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) {
      fetchBookingHistory();
    }
  }, [bookingId]);

  const handleClick = (booking) => {
    const query = new URLSearchParams({
      time: booking.showtime.start_time,
      screenNumber: booking.screen.screen_number,
      cinemaName: booking.cinema.name,
      poster: booking.movie.poster_url,
      title: booking.movie.title,
      date: booking.showtime.date,
      showtimeId: booking.showtime_id,
      movieId: booking.movie.movie_id,
      price: booking.screen.price_per_seat,
      friendSeats: JSON.stringify(booking.seats),
      genres: JSON.stringify(booking.movie.genre),
      language: JSON.stringify(booking.movie.languages),
    }).toString();

    router.push(`/booking/seats/seat?${query}`);
  };

  return (
    <>
      {booking && (
        <Head>
          <title>{booking.movie.title} | Booking Detail</title>
          <meta
            property="og:title"
            content={`จองตั๋วหนังที่ ${booking.cinema.name}`}
          />
          <meta
            property="og:description"
            content={`ดูหนังที่ ${booking.cinema.name} วันที่ ${
              booking.showtime.date
            } เวลา ${booking.showtime.start_time} ที่นั่ง ${
              Array.isArray(booking.seats)
                ? booking.seats.join(", ")
                : booking.seats
            }`}
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content={`https://6881-171-97-99-145.ngrok-free.app/booking-detail/${booking.booking_id}`}
          />
          <meta property="og:image" content={booking.movie.poster_url} />
        </Head>
      )}
      <div className="min-h-screentext-white flex flex-col justify-center items-center">
        <Navbar />
        <div className="mt-[100px] ">
          <h1 className="text-3xl font-bold mb-10">Booking Detail</h1>
          <div className="flex justify-center items-start gap-12">
            {/* Poster */}
            {booking && (
              <Image
                src={booking.movie.poster_url}
                alt={booking.movie.title}
                width={300}
                height={440}
                className="w-[300px] h-[440px] rounded-lg shadow-lg object-cover"
              />
            )}
            {/* Details */}
            {booking && (
              <div className="bg-[#101525] rounded-xl p-8 w-[420px] shadow-lg">
                <h2 className="text-3xl font-bold mb-4">
                  {booking.movie.title}
                </h2>
                <div className="flex gap-2 mb-4">
                  {booking.movie.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-[#232B47] text-xs px-3 py-1 rounded-full"
                    >
                      {genre || ""}
                    </span>
                  ))}
                  <span className="bg-[#232B47] text-xs px-3 py-1 rounded-full">
                    {booking.movie.languages}
                  </span>
                </div>
                <div className="mb-4 space-y-2 text-base-gray-300">
                  <div>🎬 {booking.cinema.name}</div>
                  <div>📅 {booking.showtime.date}</div>
                  <div>⏰ {booking.showtime.start_time}</div>
                  <div>🏛 Hall {booking.hall || 1}</div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-[#232B47] px-4 py-2 rounded text-white">
                    {Array.isArray(booking.seats) ? booking.seats.length : 0}{" "}
                    Tickets
                  </span>
                  <span>
                    Selected Seat{" "}
                    <b>
                      {Array.isArray(booking.seats)
                        ? booking.seats.join(", ")
                        : "-"}
                    </b>
                  </span>
                </div>
                <button
                  className="bg-[#4F7BFF] hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition mb-6"
                  onClick={() => handleClick(booking)}
                >
                  Book more seats
                </button>
                <div className="text-base-gray-400 mt-6 text-sm leading-relaxed">
                  {booking.movie.description}
                </div>
              </div>
            )}
          </div>
          {loading && (
            <div className="text-xl text-center mt-12">กำลังโหลด...</div>
          )}
          {error && (
            <div className="text-xl text-red-500 text-center mt-12">
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
