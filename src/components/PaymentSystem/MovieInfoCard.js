import Image from 'next/image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorefrontIcon from '@mui/icons-material/Storefront';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  // รองรับทั้ง HH:mm:ss และ HH:mm
  const [h, m] = timeStr.split(":");
  if (!h || !m) return timeStr;
  return `${h}:${m}`;
}

export default function MovieInfoCard({
  time,
  poster,
  title,
  genres,
  language,
  date,
  cinemaName,
  screenNumber,
}) {

 let genreArr = [];
  try {
    genreArr = typeof genres === "string" ? JSON.parse(decodeURIComponent(genres)) : genres;
  } catch {
    genreArr = [];
  }
  let lang = "";
  try {
    lang = typeof language === "string" ? JSON.parse(decodeURIComponent(language)) : language;
    if (typeof lang === "object" && lang?.name) lang = lang.name;

  } catch {
    lang = language;
  }


  if (typeof lang === "string" && lang.trim().toUpperCase() === "ENGLISH") lang = "EN";
  if (typeof lang === "string" && lang.trim().toUpperCase() === "THAI") lang = "TH";
  if (typeof lang === "string" && lang.trim().toUpperCase() === "CHINESE") lang = "CN";
  if (typeof lang === "string" && lang.trim().toUpperCase() === "KOREAN") lang = "KR";
  if (typeof lang === "string" && lang.trim().toUpperCase() === "JAPANESE") lang = "JP";


  return (
    <div className="bg-[#070C1B] w-screen max-w-none flex flex-col gap-4 shadow-md px-[16px] pt-[16px] pb-[24px] -mx-4">
      <div className="flex items-center gap-2">
        <span className="body-2-regular text-base-gray-300 text-sm">
          Time remaining: 
        </span>
        <span className="body-2-regular text-brand-blue">
          04:55
        </span>
      </div>
      <div className="flex gap-4 mt-[-10px]">
        <Image
          src={poster}
          alt={title}
          width={82.21}
          height={120}
          className="rounded object-cover"
        />
        <div className="flex-1 flex flex-col justify-center">
          <div className=" text-white headline-4 ">{title}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {genreArr.map(g => (
              <span key={g} className="bg-base-gray-100 text-base-gray-300 text-xs px-3 py-1 rounded">{g}</span>
            ))}
            {lang && (
              <span className="bg-base-gray-100 text-base-gray-400 text-xs px-3 py-1 rounded">{lang}</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 text-base-gray-400 text-sm flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <LocationOnIcon className="text-base-gray-200 text-sm" style={{ fontSize: 16 }} />
          <span>{cinemaName}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarMonthIcon className="text-base-gray-200 text-sm" style={{ fontSize: 16 }} />
          <span>{formatDate(date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <AccessTimeIcon className="text-base-gray-200 text-sm" style={{ fontSize: 16 }} />
          <span>{formatTime(time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <StorefrontIcon className="text-base-gray-200 text-sm" style={{ fontSize: 16 }} />
          <span>{screenNumber}</span>
        </div>
      </div>
    </div>
  );
}