import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { useStatus } from "@/context/StatusContext";
import axios from "axios";

export default function BookingCard({
  time,
  screenNumber,
  cinemaName,
  poster,
  title,
  genres,
  language,
  date,
  seat,
  price,
  showtimes,
  movieId,
  existingBookingId, // NEW: Accept existing booking ID
}) {
  const { isLoggedIn, user } = useStatus();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  let genreArr = [];
  try {
    genreArr =
      typeof genres === "string"
        ? JSON.parse(decodeURIComponent(genres))
        : genres;
  } catch {
    genreArr = [];
  }
  let lang = "";
  try {
    lang =
      typeof language === "string"
        ? JSON.parse(decodeURIComponent(language))
        : language;
    if (typeof lang === "object" && lang?.name) lang = lang.name;
  } catch {
    lang = language;
  }

  if (typeof lang === "string" && lang.trim().toUpperCase() === "ENGLISH")
    lang = "EN";
  if (typeof lang === "string" && lang.trim().toUpperCase() === "THAI")
    lang = "TH";
  if (typeof lang === "string" && lang.trim().toUpperCase() === "CHINESE")
    lang = "CN";
  if (typeof lang === "string" && lang.trim().toUpperCase() === "KOREAN")
    lang = "KR";
  if (typeof lang === "string" && lang.trim().toUpperCase() === "JAPANESE")
    lang = "JP";

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

  const handleSumbit = async () => {
    if (!isLoggedIn) {
      const currentUrl = router.asPath;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (isSubmitting) {
      return; // ป้องกันการคลิกซ้ำ
    }

    setIsSubmitting(true);
    setSubmitError("");
    let bookingId = existingBookingId;

    try {
      if (existingBookingId) {
        try {
          const response = await axios.put(
            `/api/booking/${existingBookingId}`,
            {
              showtimeId: showtimes,
              seatNumber: seat,
              sumPrice: price,
            }
          );

          bookingId = existingBookingId;
        } catch (updateError) {
          if (updateError.response?.status === 410) {
            // Booking หมดอายุแล้ว ให้ทำต่อเหมือนสร้างใหม่
            // (fall through to create new booking)
          } else {
            throw updateError; // Re-throw other errors
          }
        }
      }

      // CREATE new booking (or when existing booking expired)
      if (!existingBookingId || bookingId === undefined) {
        // ตรวจสอบสถานะที่นั่งก่อนจอง

        const checkResponse = await axios.get(`/api/seats/${showtimes}`);
        const currentSeats = checkResponse.data || [];

        // ตรวจสอบว่าที่นั่งที่เลือกยังว่างอยู่หรือไม่
        const unavailableSeats = seat.filter((seatId) => {
          const seatData = currentSeats.find((s) => s.id === seatId);
          // Check if seat is booked or reserved by someone else
          return (
            seatData &&
            (seatData.status === "booked" ||
              (seatData.status === "reserved" &&
                seatData.reserved_by !== user?.id))
          );
        });

        if (unavailableSeats.length > 0) {
          throw new Error(
            `Seats ${unavailableSeats.join(", ")} are already booked`
          );
        }

        // CREATE new booking
        const response = await axios.post("/api/booking/booking-seat", {
          showtimeId: showtimes,
          seatNumber: seat,
          sumPrice: price,
        });

        bookingId = response.data.data[0].booking_id;
      }
    } catch (error) {
      console.error("Error booking seat:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setIsSubmitting(false);

      if (error.response?.status === 409) {
        setSubmitError(
          "Selected seats are already booked. Please select new seats."
        );
        // รีโหลดหน้าเพื่ออัปเดตสถานะที่นั่ง
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (error.response?.status === 410) {
        setSubmitError("Booking has expired. Please try booking again.");
        // รีโหลดหน้าเพื่อรีเซ็ตสถานะ
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (error.response?.status === 500) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Internal system error occurred";
        console.error("500 Error details:", error.response?.data);
        setSubmitError(`Server error: ${errorMessage}`);
      } else if (
        error.message &&
        error.message.includes("are already booked")
      ) {
        setSubmitError(error.message);
        // รีโหลดหน้าเพื่ออัปเดตสถานะที่นั่ง
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSubmitError("An error occurred while booking. Please try again.");
      }
      return;
    }

    const query = new URLSearchParams({
      poster: poster,
      title: title,
      time: time,
      date: date,
      screenNumber: screenNumber,
      genres: JSON.stringify(genres),
      language: JSON.stringify(language),
      cinemaName: cinemaName,
      seat: JSON.stringify(seat),
      price: price,
      showtimes: showtimes,
      movieId: movieId,
      bookingId: bookingId,
    }).toString();

    setIsSubmitting(false);
    router.push(`/booking/seats/payment/payment?${query}`);
  };

  return (
    <>
      <div className="h-min w-auto md:basis-1/5 flex flex-col p-4 bg-[--base-gray-0] rounded-lg shadow-md">
        <div className="flex rounded-t-lg">
          <Image
            src={poster}
            alt="Movie Poster"
            width={82}
            height={120}
            className="object-cover rounded-lg"
          />
          <div className="flex flex-col w-auto pl-4 rounded-t-lg">
            <h2 className="text-white text-wrap text-xl font-bold mb-3">
              {title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-[--base-gray-100] py-[4px] md:py-[6px] px-3 rounded text-sm md:text-sm text-[--base-gray-300]"
                >
                  {genre?.movie_genres?.name || genre?.name || genre || ""}
                </span>
              ))}
              {lang && (
                <span className="bg-[--base-gray-100] py-[4px] md:py-[6px] px-3 rounded text-sm md:text-sm text-[--base-gray-400]">
                  {lang.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full pt-6 text-[--base-gray-400] text-base">
          <div className="flex items-center gap-2">
            <FmdGoodIcon className="text-[--base-gray-200]" fontSize="small" />
            <span>{cinemaName}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarMonthIcon
              className="text-[--base-gray-200]"
              fontSize="small"
            />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <AccessTimeIcon
              className="text-[--base-gray-200]"
              fontSize="small"
            />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MeetingRoomIcon
              className="text-[--base-gray-200]"
              fontSize="small"
            />
            <span>Hall {screenNumber}</span>
          </div>
          {seat.length === 0 ? null : (
            <>
              <div className="flex flex-row justify-between items-center gap-2">
                <p className="text-[--base-gray-300] text-center mt-4">
                  Selected Seat
                </p>
                <p className="text-[#FFFFFF] text-center mt-4">
                  {seat.length > 0 ? seat.join(", ") : ""}
                </p>
              </div>
              <div className="flex flex-row justify-between items-center gap-2">
                <p className="text-[--base-gray-300] text-center">Total</p>
                <p className="text-[#FFFFFF] text-center ">
                  {price > 0 ? `THB${price}` : ""}
                </p>
              </div>
              {submitError && (
                <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm">
                  {submitError}
                </div>
              )}
              <button
                onClick={handleSumbit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg mt-4 transition-colors ${
                  isSubmitting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#4E7BEE] hover:bg-[#5a8cd9]"
                } text-white`}
              >
                {isSubmitting
                  ? "Booking..."
                  : existingBookingId
                  ? "Continue to Payment"
                  : "Next"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
