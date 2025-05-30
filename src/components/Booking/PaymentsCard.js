import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CouponPaymentCard from "../Coupon-PaymentCard/PaymentMobile";
export default function PaymentsCard({
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
}) {
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
  console.log(seatArr);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center w-[375px]  p-4 bg-[#18192b] rounded-lg shadow-md">
          <div className="flex items-center justify-center w-full h-16 rounded-t-lg">
            <img
              src={poster}
              alt="Movie Poster"
              className="w-[82px] h-[120px] object-cover rounded-lg mb-4"
            />
            <div className="flex-col w-full h-16 rounded-t-lg flex items-center justify-center">
              <h2 className="text-white text-2xl font-bold mb-3 text-center">
                {title}
              </h2>
              <div className="flex gap-2 ">
                {genreArr?.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-[--base-gray-100] py-[4px] md:py-[6px] px-3 rounded text-xs md:text-sm text-[--base-gray-300] font-medium"
                  >
                    {genre?.movie_genres?.name || genre?.name || genre || ""}
                  </span>
                ))}
                {lang && (
                  <span className="bg-[--base-gray-100] py-[4px] md:py-[6px] px-3 rounded text-xs md:text-sm text-[#C8CEDD] font-medium">
                    {lang.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full pt-10 text-[--base-gray-300] text-base">
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
            {seatArr.length === 0 ? null : (
              <>
              <div className="flex flex-col justify-between items-center gap-2">
                <CouponPaymentCard />
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
