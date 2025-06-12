import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Head from "next/head";
import axios from "axios";
import Navbar from "@/components/Navbar/Navbar";
import FooterSection from "@/components/sections/FooterSection/FooterSection";
import Image from "next/image";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

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

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTimes(timeStr) {
    if (!timeStr) return "";
    // รองรับทั้ง "13:00:00" หรือ "13:00"
    const [hour, minute] = timeStr.split(":");
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }

  return (
    <>
      <Navbar />
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
      <div className="flex flex-col">
        <div className="mt-12 md:mt-[144px] md:px-[120px] md:pb-[88px]">
          <h1 className="mt-10 ml-4 mb-6 md:ml-[120px] md:mt-0 md:mb-8 text-4xl font-bold">Booking Detail</h1>
          <div className="flex flex-col md:flex-row justify-center items-start gap-6">
            {/* Poster */}
            {booking && (
              <Image
                src={booking.movie.poster_url}
                alt={booking.movie.title}
                width={300}
                height={440}
                className="w-auto rounded-sm object-cover"
              />
            )}
            {/* Details */}
            {booking && (
              <div className="bg-[--base-gray-0] backdrop-blur-[24px] rounded-xl p-4 md:p-10">
                <h2 className="text-4xl font-bold mb-2">
                  {booking.movie.title}
                </h2>
                <div className="flex gap-2 mb-6">
                  {booking.movie.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-[--base-gray-100] text-sm text-[--base-gray-300] px-3 py-[6px] rounded-sm"
                    >
                      {genre || ""}
                    </span>
                  ))}
                  <span className="bg-[--base-gray-100] text-sm text-[--base-gray-400] px-3 py-[6px] rounded-sm">
                    {booking.movie.languages}
                  </span>
                </div>
                <div className="mb-12 space-y-2 text-base-gray-300">
                  <div className="flex items-center gap-2">
                    <FmdGoodIcon fontSize="small" className="gap-22"/> {booking.cinema.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarMonthIcon fontSize="small" className="gap-22"/>{" "}
                    {formatDate(booking.showtime.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <AccessTimeIcon fontSize="small" className="gap-22"/>{" "}
                    {formatTimes(booking.showtime.start_time)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MeetingRoomIcon fontSize="small" className="gap-22"/> Hall{" "}
                    {booking.hall || 1}
                  </div>
                </div>
                <div className="flex items-center gap-6 mb-12">
                  <div className="bg-[--base-gray-100] px-4 py-2 rounded text-[--base-gray-400]">
                    {Array.isArray(booking.seats) ? booking.seats.length : 0}{" "}
                    Tickets
                  </div>
                  <div className="text-[--base-gray-400]">
                    Selected Seat{" "}
                    <b className="text-white ml-6">
                      {Array.isArray(booking.seats)
                        ? booking.seats.join(", ")
                        : "-"}
                    </b>
                  </div>
                </div>
                <button
                  className="bg-[--brand-blue-100] hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-sm transition mb-12"
                  onClick={() => handleClick(booking)}
                >
                  Book more seats
                </button>
                <div className="text-base-gray-400 leading-relaxed border-t border-[--base-gray-100] pt-12">
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
      <FooterSection className="block md:hidden"/>
    </>
  );
}
