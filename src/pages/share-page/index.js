import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function SharePage({ bookingData, isSuccessPage }) {
  const router = useRouter();
  const [booking, setBooking] = useState(bookingData);
  const [copyStatus, setCopyStatus] = useState(false);



    const getShareUrl = () => {
        const baseUrl = `https://minor-cineplex-final-project.vercel.app/booking-detail/${bookingData.booking_id}`;
        const ogParams = new URLSearchParams({
            title: `Booking for ${bookingData?.movie_title}`,
            description: `I'm going to watch ${bookingData?.movie_title} at ${bookingData?.cinema_name} on ${bookingData?.showtime_date}!`,
            
        });
        return `${baseUrl}?${ogParams.toString()}`;
    };

    const shareToFacebook = () => {
        const text = `I'm going to watch ${bookingData?.movie_title} at ${bookingData?.cinema_name} on ${bookingData?.showtime_date}!`;
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&quote=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

  const shareToX = () => {
    const text = `I'm going to watch ${bookingData?.movie_title} at ${bookingData?.cinema_name} on ${bookingData?.showtime_date} !`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text + " " + getShareUrl()
    )}`;
    window.open(xUrl, "_blank");
  };

    const shareToMessenger = () => {
        const appId = '1257229256034525';
        const url = `https://www.facebook.com/dialog/send?` +
                    `app_id=${appId}&` +
                    `link=${encodeURIComponent(getShareUrl())}&` +
                    `redirect_uri=${encodeURIComponent(getShareUrl())}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

  const shareToLine = () => {
    const text = `I'm going to watch ${bookingData?.movie_title} at ${bookingData?.cinema_name}!`;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text + " " + getShareUrl())}`;
    window.open(lineUrl, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopyStatus(true);
      setTimeout(() => {
        setCopyStatus(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!booking) {
    return (
      <div className=" bg-[#070C1B] text-white p-8 flex items-center justify-center">
        กำลังโหลด...
      </div>
    );
  }

  return (
    //popup box
    <div
      className={`text-white p-4 bg-base-gray-100 shadow-[4px_4px_30px_0px_rgba(0,0,0,0.5)] rounded-[10px]  ${
        isSuccessPage
          ? "w-[274px] h-[208px] md:w-[400px] md:h-[140px] lg:w-[432px] lg:h-[160px] flex items-center justify-center mb-4 md:mb-0 md:mt-0 lg:mt-0"
          :"w-[274px] h-[208px] md:w-[400px] md:h-[140px] lg:w-[432px] lg:h-[160px] flex items-center justify-center mb-4 md:mb-0 md:mt-0 lg:mt-0"
      }`}
    >
      <div className="w-full flex flex-col justify-center">
        <h1 className="text-[20px] font-bold mb-2 text-center">
          Share Booking
        </h1>
        <div className="grid grid-rows-2 grid-cols-3 gap-2 md:flex md:flex-row md:justify-between md:gap-1">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={shareToFacebook}
              className="flex items-center gap-2 text-white rounded-full bg-[--base-gray-300] py-[10px] px-[10px] hover:bg-[#166FE5] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <h1>Facebook</h1>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={shareToX}
              className="flex items-center gap-2 text-white rounded-full bg-[--base-gray-300] py-[10px] px-[10px] hover:bg-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <h1>Twitter</h1>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={shareToMessenger}
              className="flex items-center gap-2 bg-[#0084FF] text-white rounded-full bg-[--base-gray-300] py-[10px] px-[10px] hover:bg-[#0073E6] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.36 2 2 6.13 2 11.7C2 14.61 3.19 17.14 5.14 18.87C5.3 19 5.4 19.22 5.41 19.44L5.46 21.22C5.5 21.79 6.07 22.16 6.59 21.93L8.57 21.06C8.74 21 8.93 20.97 9.1 21C10 21.27 11 21.4 12 21.4C17.64 21.4 22 17.27 22 11.7C22 6.13 17.64 2 12 2ZM18 9.46L15.07 14.13C14.6 14.86 13.6 15.05 12.9 14.5L10.56 12.77C10.35 12.61 10.05 12.61 9.84 12.77L6.68 15.17C6.26 15.5 5.73 14.96 6.09 14.53L9 9.86C9.47 9.13 10.47 8.94 11.17 9.49L13.5 11.22C13.72 11.38 14.01 11.38 14.23 11.22L17.39 8.82C17.81 8.49 18.34 9.03 18 9.46Z" />
              </svg>
            </button>
            <h1>Messenger</h1>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={shareToLine}
              className="flex items-center gap-2 bg-[#06C755] text-white rounded-full bg-[--base-gray-300] py-[10px] px-[10px] hover:bg-[#05B54A] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </button>
            <h1>Line</h1>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 py-[10px] px-[10px] rounded-full transition-colors ${
                copyStatus
                  ? "bg-[--base-gray-200] text-white"
                  : "bg-[--base-gray-300] text-white"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            </button>
            <h1>Copy link</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
