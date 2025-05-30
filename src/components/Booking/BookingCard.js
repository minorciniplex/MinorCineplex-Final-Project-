import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import Image from "next/image";

export default function BookingCard({
  time,
  screenNumber,
  cinemaName,
  poster,
  title,
  genres,
  language,
  date,
}) {
  // แปลง genres และ language ถ้ามาเป็น string
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
    <div className="">
      <div className="flex flex-col items-center w-[375px] p-4 bg-[--base-gray-0] rounded-lg shadow-md">
        <div className="flex w-full rounded-t-lg gap-4">
          <Image
            src={poster}
            alt="Movie Poster"
            width={82}
            height={120}
            className="object-cover rounded-lg"
          />
          <div className="flex flex-col justify-center w-full rounded-t-lg">
            <h2 className="text-white text-2xl font-bold mb-3">{title}</h2>
            <div className="flex gap-2">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-[--base-gray-100] py-[4px] md:py-[6px] px-3 rounded text-xs md:text-sm text-[--base-gray-300] font-medium"
                >
                  {genre?.movie_genres?.name || genre?.name || genre}
                </span>
              ))}
              {lang && (
                <span className="bg-[--base-gray-100] py-[4px] md:py-[6px] px-3 rounded text-xs md:text-sm text-[--base-gray-400] font-medium">
                  {lang.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full pt-6 text-[--base-gray-400]">
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
              className="text-[--base-gray-200] align-middle"
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
        </div>
      </div>
    </div>
  );
}
