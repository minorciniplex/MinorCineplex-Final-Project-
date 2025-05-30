import React, { useState, useRef } from "react";
import Navbar from "../Navbar/Navbar";
import CheckIcon from '@mui/icons-material/Check';
import Image from 'next/image';
import MovieInfoCard from "../MovieInfoCard";
import { useMovieDetail } from '@/hooks/useMovieDetail';

export default function PaymentMobile() {
  const [tab, setTab] = useState("credit");
  const [card, setCard] = useState({
    number: "",
    owner: "",
    expiry: "",
    cvc: "",
  });
  const expiryInputRef = useRef(null);

  // ตัวอย่าง movie_id (ควรรับจาก prop, route, หรือ context จริง)
  const movie_id = "013b897b-3387-4b7f-ab23-45b78199020a";
  const { movie, genres, languages, showtime, hall, cinema, loading } = useMovieDetail(movie_id);

  return (
    <div className="bg-background w-screen min-h-screen text-white font-sans overflow-x-hidden">
      <Navbar />
      {/* Stepper */}
      <div className="w-[375px] h-[102px] bg-base-gray-0 flex flex-col justify-center items-center mt-[50px] relative">
        {/* เส้นเดียวตรงกลาง */}
        <div className="absolute left-0 right-0 top-[36%] transform -translate-y-1/2 h-px bg-[#21263F] z-0 mx-[80px]" />
        {/* วงกลม stepper */}
        <div className="flex justify-between items-center w-full px-[46px] z-10">
          <div className="flex flex-col items-center">
            <div className="w-[44px] h-[44px] rounded-full bg-brand-blue-200 flex items-center justify-center text-white text-bold">
              <CheckIcon />
            </div>
            <span className="body-2-regular mt-2">Select showtime</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[44px] h-[44px] rounded-full bg-brand-blue-200 flex items-center justify-center text-white text-bold">
              <CheckIcon />
            </div>
            <span className="body-2-regular mt-2">Select seat</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[44px] h-[44px] rounded-full bg-[#3B82F6] flex items-center justify-center text-white headline-4">3</div>
            <span className="body-2-regular mt-2">Payment</span>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div className="flex mt-[50px] px-4">
        <button
          className="flex-1 flex justify-center"
          onClick={() => setTab('credit')}
        >
          <span
            className={`headline-3 pb-1 px-[7px] inline-block ${tab === 'credit' ? 'border-b-[1px] border-[#565F7E] text-white' : 'border-b-0 text-[#8B93B0]'}`}
          >
            Credit card
          </span>
        </button>
        <button
          className="flex-1 flex justify-center"
          onClick={() => setTab('qr')}
        >
          <span
            className={`headline-3 pb-1 px-[7px] inline-block ${tab === 'qr' ? 'border-b-[1px] border-[#565F7E] text-white' : 'border-b-0 text-[#8B93B0]'}`}
          >
            QR Code
          </span>
        </button>
      </div>

      {/* Credit Card Form */}
      {tab === "credit" && (
        <form className="px-4 mt-4 space-y-4">
          <div>
            <label className="block body-2-regular text-base-gray-400 mb-1">Card number</label>
            <input
              className="w-[343px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
              placeholder="Card number"
              value={card.number}
              onChange={e => setCard({ ...card, number: e.target.value })}
            />
          </div>
          <div>
            <label className="block body-2-regular text-base-gray-400 mb-1">Card owner</label>
            <input
              className="w-[343px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
              placeholder="Card owner name"
              value={card.owner}
              onChange={e => setCard({ ...card, owner: e.target.value })}
            />
          </div>
          <div>
            <label className="block body-2-regular text-base-gray-400 mb-1">Expiry date</label>
            <div className="relative">
              <input
                ref={expiryInputRef}
                type="date"
                className="w-[343px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none pr-[40px]"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={e => setCard({ ...card, expiry: e.target.value })}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => {
                  if (expiryInputRef.current) {
                    if (expiryInputRef.current.showPicker) {
                      expiryInputRef.current.showPicker();
                    } else {
                      expiryInputRef.current.focus();
                    }
                  }
                }}
              >
                <Image src="/assets/images/Date_today_light.png" alt="calendar" width={20} height={20} className="object-contain" />
              </span>
              <style jsx global>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                  opacity: 0;
                  display: none;
                }
              `}</style>
            </div>
          </div>
          <div>
            <label className="block body-2-regular text-base-gray-400 mb-1">CVC</label>
            <input
              className="w-[343px] h-[48px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
              placeholder="CVC"
              value={card.cvc}
              onChange={e => setCard({ ...card, cvc: e.target.value })}
            />
          </div>
        </form>
      )}

      {/* QR Code Tab */}
      {tab === "qr" && (
        <div className="px-4 mt-4 text-center text-gray-400">
          <div className="bg-[#232B47] rounded py-10">[QR Code Placeholder]</div>
          <div className="mt-2 text-xs">Scan QR code to pay</div>
        </div>
      )}
      {/* Movie Info */}
      <div className="px-4 mt-6">
        {loading ? (
          <div className="text-base-gray-300 text-center">Loading...</div>
        ) : movie ? (
          <MovieInfoCard
            title={movie.title}
            genres={genres}
            image={movie.poster_url}
            cinema={cinema?.name}
            date={showtime?.date}
            time={showtime?.start_time}
            hall={hall?.screen_number}
          />
        ) : (
          <div className="text-red-400 text-center">ไม่พบข้อมูลหนัง</div>
        )}
      </div>
      {/* Coupon */}
      <div className="px-4 mt-4">
        <div className="bg-[#232B47] rounded px-3 py-2 flex items-center justify-between text-xs">
          <span>Merry March Magic – Get 50 THB Off! (Only in March)</span>
          <button className="ml-2 text-gray-400">✕</button>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 mt-4 text-xs">
        <div className="flex justify-between">
          <span>Selected Seat</span>
          <span>{Array.isArray(movie?.seats) ? movie.seats.join(", ") : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment method</span>
          <span>{movie?.payment || "-"}</span>
        </div>
        <div className="flex justify-between text-red-400">
          <span>Coupon</span>
          <span>{movie?.coupon || "-"}</span>
        </div>
        <div className="flex justify-between font-bold mt-1">
          <span>Total</span>
          <span>{movie?.total || "-"}</span>
        </div>
      </div>

      {/* Next Button */}
      <div className="px-4 mt-6 mb-4">
        <button className="w-full bg-[#3B82F6] py-3 rounded text-white font-bold text-lg" disabled>
          Next
        </button>
      </div>
    </div>
  );
} 