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
  title = "The Dark Knight",
  genres = ["Action", "Crime", "TH"],
  image = "https://m.media-amazon.com/images/I/51k0qa6qH-L._AC_SY679_.jpg",
  cinema = "Minor Cineplex Arkham",
  date = "24 Jun 2024",
  time = "16:30",
  hall = "Hall 1",
  languages = ["TH/EN"]
}) {
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
          src={image}
          alt={title}
          width={82.21}
          height={120}
          className="rounded object-cover"
        />
        <div className="flex-1 flex flex-col justify-center">
          <div className=" text-white headline-4 ">{title}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {genres.map(g => (
              <span key={g} className="bg-base-gray-100 text-base-gray-300 text-xs px-3 py-1 rounded">{g}</span>
            ))}
            {languages && languages.map(l => (
              <span key={l} className="bg-base-gray-100 text-base-gray-400 text-xs px-3 py-1 rounded">{l}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 text-base-gray-400 text-sm flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <LocationOnIcon className="text-base-gray-200 text-sm" style={{ fontSize: 16 }} />
          <span>{cinema}</span>
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
          <span>{hall}</span>
        </div>
      </div>
    </div>
  );
} 