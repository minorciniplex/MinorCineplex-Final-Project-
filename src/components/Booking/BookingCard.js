import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {useStatus} from "@/context/StatusContext";

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
  movieId
}) {
  const { isLoggedIn, user } = useStatus();

  const router = useRouter();
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

  const handleSumbit = () => {
    // ตัวอย่างการ push ไปหน้าจองตั๋ว


    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    const query = new URLSearchParams({
      poster: poster,
      title: title,
      time: time,
      date: date,
      screenNumber: screenNumber,
      genres: JSON.stringify(genres), // แปลง object เป็น string
      language: JSON.stringify(language),
      cinemaName: cinemaName,
      seat: JSON.stringify(seat),
      price: price,
    }).toString();

    router.push(`/booking/seats/payment/payment?${query}`);
  };

  return (
    <>
      <div className="h-min sm:basis-1/4 flex flex-col sm:flex-1 p-4 bg-[--base-gray-0] rounded-lg shadow-md">
        <div className="flex w-full rounded-t-lg">
          <Image
            src={poster}
            alt="Movie Poster"
            width={82}
            height={120}
            className="object-cover rounded-lg"
          />
          <div className="flex flex-col w-[300px] pl-4 rounded-t-lg">
            <h2 className="text-white text-wrap text-xl font-bold mb-3">
              {title}
            </h2>
            <div className="flex flex-wrap gap-2 sm:w-max">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className=" bg-[--base-gray-100] py-[4px] md:py-[6px] px-3 rounded text-sm md:text-sm text-[--base-gray-300]"
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
              <button
                onClick={handleSumbit}
                className="bg-[#4E7BEE] text-white px-4 py-2 rounded-lg mt-4 hover:bg-[#5a8cd9] transition-colors"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
