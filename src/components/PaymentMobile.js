import React, { useState } from "react";
import Navbar from "./Navbar/Navbar";
import CheckIcon from '@mui/icons-material/Check';

export default function PaymentMobile() {
  const [tab, setTab] = useState("credit");
  const [card, setCard] = useState({
    number: "",
    owner: "",
    expiry: "",
    cvc: "",
  });

  // Mock ข้อมูลหนัง
  const movie = {
    title: "The Dark Knight",
    genres: ["Action", "Crime", "TH"],
    cinema: "Minor Cineplex Arkham",
    date: "24 Jun 2024",
    time: "16:30",
    hall: "Hall 1",
    img: "https://m.media-amazon.com/images/I/51k0qa6qH-L._AC_SY679_.jpg",
    seats: ["C9", "C10"],
    coupon: "-THB50",
    total: "THB300",
    payment: "Credit card",
  };

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
        <form className="px-4 mt-4 space-y-3">
          <input
            className="w-full bg-[#232B47] rounded px-3 py-2 text-sm placeholder-gray-400"
            placeholder="Card number"
            value={card.number}
            onChange={e => setCard({ ...card, number: e.target.value })}
          />
          <input
            className="w-full bg-[#232B47] rounded px-3 py-2 text-sm placeholder-gray-400"
            placeholder="Card owner name"
            value={card.owner}
            onChange={e => setCard({ ...card, owner: e.target.value })}
          />
          <div className="flex space-x-2">
            <input
              className="flex-1 bg-[#232B47] rounded px-3 py-2 text-sm placeholder-gray-400"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={e => setCard({ ...card, expiry: e.target.value })}
            />
            <input
              className="flex-1 bg-[#232B47] rounded px-3 py-2 text-sm placeholder-gray-400"
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
        <div className="flex items-center">
          <img src={movie.img} alt="movie" className="w-16 h-24 rounded object-cover" />
          <div className="ml-3 flex-1">
            <div className="font-bold">{movie.title}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {movie.genres.map(g => (
                <span key={g} className="bg-[#232B47] text-xs px-2 py-0.5 rounded">{g}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs space-y-1">
          <div>📍 {movie.cinema}</div>
          <div>🗓️ {movie.date}</div>
          <div>⏰ {movie.time}</div>
          <div>🏟️ {movie.hall}</div>
        </div>
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
          <span>{movie.seats.join(", ")}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment method</span>
          <span>{movie.payment}</span>
        </div>
        <div className="flex justify-between text-red-400">
          <span>Coupon</span>
          <span>{movie.coupon}</span>
        </div>
        <div className="flex justify-between font-bold mt-1">
          <span>Total</span>
          <span>{movie.total}</span>
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