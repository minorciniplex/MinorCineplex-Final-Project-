import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CouponPaymentCard from "../Coupon-PaymentCard/CouponApply";
import useCountdown from "../../hooks/useCountdown";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SumPaymentDiscount from "../Coupon-PaymentCard/Components/SumPaymentDiscount";
import Image from "next/image";

export default function PaymentsCard({
  time,
  screenNumber,
  cinemaName,
  poster,
  title,
  genres,
  language,
  date,
  seatNumber,
  price,
  showtimes,
  movieId,
  bookingId,
  paymentMethod,
  isCardComplete,
  onSeatExpired
}) {
  const router = useRouter();
  const {
    timeLeft,
    isTimerActive,
    formatTime,
    startReservation,
    cancelReservation,
  } = useCountdown(seatNumber, showtimes, bookingId, null, null, onSeatExpired);
  //fix error 500
  useEffect(() => {
    if (router.isReady && bookingId && showtimes) {
      startReservation();
    }
  }, [router.isReady, bookingId, showtimes]);
  

  // แปลง genres และ language ถ้ามาเป็น string
  let seatArr = [];
  try {
    seatArr =
      typeof seat === "string"
        ? JSON.parse(seat)
        : Array.isArray(seat)
        ? seat
        : [];
  } catch {
    seatArr = [];
  }

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

  return (
    <>
      <div className="h-min w-full lg:w-auto flex flex-col p-4 lg:p-4 bg-[--base-gray-0] lg:rounded-lg lg:shadow-md">
        <div className="flex flex-col w-full bg-[--base-gray-0] lg:rounded-lg lg:shadow-md">
          {isTimerActive && (
            <div className="rounded-lg text-sm font-normal mb-4">
              <div className="text-[--base-gray-300] text-center lg:text-left">
                Time remaining:
                <span className="text-[--brand-blue-100] ml-2 font-semibold">
                  {formatTime(Number(timeLeft))}
                </span>
              </div>
            </div>
          )}
          <div className="flex w-full rounded-t-lg mb-4">
            <Image
              src={poster}
              alt="Movie Poster"
              width={82}
              height={123}
              className="w-[82px] lg:w-[82px] object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex flex-col flex-1 pl-4 rounded-t-lg">
              <h2 className="text-white text-xl lg:text-2xl font-bold mb-3 leading-tight">{title}</h2>
              <div className="flex flex-wrap gap-2">
                {genreArr?.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-[--base-gray-100] py-[4px] lg:py-[6px] px-3 rounded text-xs lg:text-sm text-[--base-gray-300] font-normal"
                  >
                    {genre?.movie_genres?.name || genre?.name || genre || ""}
                  </span>
                ))}
                {lang && (
                  <span className="bg-[--base-gray-100] py-[4px] lg:py-[6px] px-3 rounded text-xs lg:text-sm text-[#C8CEDD] font-normal">
                    {lang.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full text-[--base-gray-300] text-base">
            <div className="flex items-center gap-2">
              <FmdGoodIcon
                className="text-[--base-gray-300]"
                fontSize="small"
              />
              <span>{cinemaName}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarMonthIcon
                className="text-[--base-gray-300]"
                fontSize="small"
              />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <AccessTimeIcon
                className="text-[--base-gray-300]"
                fontSize="small"
              />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MeetingRoomIcon
                className="text-[--base-gray-300]"
                fontSize="small"
              />
              <span>Hall {screenNumber}</span>
            </div>
            <>
              <div className="flex flex-col justify-between items-center gap-2 w-full">
                <CouponPaymentCard 
                  showtimes={showtimes}
                  bookingId={bookingId}
                  bookingSeats={seatNumber}
                  paymentMethod={paymentMethod}
                  isCardComplete={paymentMethod === 'QR code' ? true : isCardComplete}
                />
              </div>
            </>
          </div>
        </div>
      </div>
    </>
  );
}
