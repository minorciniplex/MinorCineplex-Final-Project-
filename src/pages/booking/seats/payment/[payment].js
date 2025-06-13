import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import PaymentsCard from "@/components/Booking/PaymentsCard";
import PaymentMobile from "@/components/PaymentSystem/PaymentMobile";
import StepProgressBar from "@/components/Booking/StepProgressBar";
import { PaymentProvider } from "@/context/PaymentContext";
import { parseQueryParam } from "@/utils/jsonHelper";

export default function Seats() {
  const router = useRouter();
  const {
    time,
    screenNumber,
    cinemaName,
    poster,
    title,
    date,
    seat,
    price,
    showtimes,
    bookingId,
  } = router.query;
  const [genres, setGenres] = useState(null);
  const [language, setLanguage] = useState(null);
  const [seatNumber, setSeatNumber] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Credit card");
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [showSeatExpiredPopup, setShowSeatExpiredPopup] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      // Use safe JSON parsing helper
      setGenres(parseQueryParam(router.query, 'genres', null));
      setLanguage(parseQueryParam(router.query, 'language', null));
      setSeatNumber(parseQueryParam(router.query, 'seat', null));
    }
  }, [router.isReady]);

  return (
    <div className="w-full h-screen overflow-y-auto bg-background">
      <Navbar />
      <StepProgressBar currentPath="/booking/payment" />
      <PaymentProvider>
        <div className="flex flex-col lg:flex-row justify-center py-0 px-0 lg:py-[80px] lg:px-[120px] lg:gap-[102px] mt-0 lg:mt-0 flex-1">
          {/* Mobile: PaymentMobile แสดงบน */}
          <div className="order-1 lg:order-1 w-full lg:flex-1">
            <PaymentMobile 
              setPaymentMethod={setPaymentMethod} 
              isCardComplete={isCardComplete} 
              setIsCardComplete={setIsCardComplete}
              bookingId={router.isReady ? bookingId : undefined}
            />
          </div>
          
          {/* Mobile: PaymentsCard แสดงล่าง */}
          <div className="order-2 lg:order-2 w-full lg:w-auto mb-0 lg:mb-0">
            <PaymentsCard
              time={time}
              cinemaName={cinemaName}
              screenNumber={screenNumber}
              poster={poster}
              title={title}
              genres={genres}
              language={language}
              date={date}
              seatNumber={seat}
              bookingId={bookingId}
              showtimes={showtimes}
              paymentMethod={paymentMethod}
              isCardComplete={isCardComplete}
              onSeatExpired={() => setShowSeatExpiredPopup(true)}
            />
          </div>
        </div>
      </PaymentProvider>

      {/* Seat Expired Popup */}
      {showSeatExpiredPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div 
            className="bg-[#232B47] rounded-lg flex flex-col relative"
            style={{
              width: '343px',
              height: '184px',
              padding: '16px',
              gap: '16px'
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowSeatExpiredPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center flex-1 justify-center">
              <h3 className="text-white text-lg font-bold mb-2">Your chosen seat is no longer available</h3>
              <p className="text-gray-300 text-sm leading-5">
                Please select another seat to complete your booking
              </p>
            </div>

            {/* OK Button */}
            <button 
              onClick={() => {
                setShowSeatExpiredPopup(false);
                router.push('/'); // หรือกลับไปหน้าเลือกที่นั่ง
              }}
              className="w-full bg-[#4E7BEE] text-white font-medium py-3 rounded-[4px] hover:bg-[#3E6BDE] transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
