import React, { useState, useRef } from "react";
import Navbar from "../Navbar/Navbar";
import CheckIcon from '@mui/icons-material/Check';
import Image from 'next/image';
import MovieInfoCard from "./MovieInfoCard";
import { useMovieDetail } from '@/hooks/useMovieDetail';

import CouponDiscount from './CouponDiscount';
import { useMyCoupons } from '@/hooks/useMyCoupons';
import CouponSelectPopup from './CouponSelectPopup';
import SumPaymentDiscount from '../Coupon-PaymentCard/Components/SumPaymentDiscount';
export default function PaymentMobile() {
  const [tab, setTab] = useState("credit");
  const [card, setCard] = useState({
    number: "",
    owner: "",
    expiry: "",
    cvc: "",
  });
  const expiryInputRef = useRef(null);
  const [openCouponPopup, setOpenCouponPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // ตัวอย่าง movie_id (ควรรับจาก prop, route, หรือ context จริง)
  const movie_id = "013b897b-3387-4b7f-ab23-45b78199020a";
  const { movie, genres, languages, showtime, hall, cinema, loading } = useMovieDetail(movie_id);
  const userId = "mock-user-id"; // TODO: เปลี่ยนเป็น user id จริง
  const { coupons, loading: loadingCoupons } = useMyCoupons(userId);

  // ฟังก์ชันเมื่อกด Next
  const handleNext = () => {
    alert('Next Clicked!');
  };

  return (
    <div className="bg-background w-screen min-h-screen text-white font-sans overflow-x-hidden flex flex-col md:items-start md:justify-center">
      <div className="w-full">
        <Navbar />
      </div>
      {/* Stepper */}
      <div className="w-full">
        <div className="hidden md:flex bg-base-gray-0 justify-start mt-[80px]">
          <div className="w-full max-w-[1200px] mx-auto md:mr-[200px] ">
            <div className="h-[106px] w-full max-w-[600px] flex flex-col justify-center items-center relative mx-auto">
              <div className="absolute left-0 right-0 top-[36%] transform -translate-y-1/2 h-px bg-[#21263F] z-0 mx-[80px]" />
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
          </div>
        </div>
        <div className="flex md:hidden justify-center bg-base-gray-0 mt-[50px] relative">
          <div className="h-[106px] w-full max-w-[600px] flex flex-col justify-center items-center relative">
            <div className="absolute left-0 right-0 top-[36%] transform -translate-y-1/2 h-px bg-[#21263F] z-0 mx-[80px]" />
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
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start w-full max-w-[1200px] mx-auto md:mt-[100px]">
        {/* ฝั่งซ้าย: ฟอร์ม */}
        <div className="w-full md:w-[600px] md:ml-[-60px]">
          {/* Tab */}
          <div className="flex mt-[50px] md:mt-[-30px] gap-4 items-baseline ml-4 md:ml-4">
            <button
              className="flex justify-center md:mb-[50px]"
              onClick={() => setTab('credit')}
            >
              <span
                className={`headline-3 pb-1 px-[7px] inline-block ${tab === 'credit' ? 'border-b-[1px] border-[#565F7E] text-white' : 'border-b-0 text-[#8B93B0]'}`}
              >
                Credit card
              </span>
            </button>
            <button
              className="flex justify-center md:ml-8"
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
            <form className="px-4 mt-4 md:mt-0 space-y-4 ">
              <div className="md:flex md:space-x-4">
                <div className="md:flex-1">
                  <label className="block body-2-regular text-base-gray-400 mb-1">Card number</label>
                  <input
                    className="w-[343px] md:w-[384.5px] h-[48px] md:h-[48px] md:rounded-[4px] bg-base-gray-100 border border-base-gray-200 rounded-[4px] px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
                    placeholder="Card number"
                    value={card.number}
                    onChange={e => setCard({ ...card, number: e.target.value })}
                  />
                </div>
                <div className="md:flex-1 mt-4 md:mt-0">
                  <label className="block body-2-regular text-base-gray-400 mb-1">Card owner</label>
                  <input
                    className="w-[343px] md:w-[384.5px] h-[48px] md:h-[48px] md:rounded-[4px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
                    placeholder="Card owner name"
                    value={card.owner}
                    onChange={e => setCard({ ...card, owner: e.target.value })}
                  />
                </div>
              </div>
              <div className="md:flex md:space-x-4">
                <div className="md:flex-1">
                  <label className="block body-2-regular text-base-gray-400 mb-1">Expiry date</label>
                  <div className="relative">
                    <input
                      ref={expiryInputRef}
                      type="text"
                      className="w-[343px] md:w-[384.5px] h-[48px] md:h-[48px] md:rounded-[4px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none pr-[40px]"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={card.expiry}
                      onChange={e => {
                        let value = e.target.value.replace(/[^0-9/]/g, '');
                        if (value.length === 2 && card.expiry.length === 1) value += '/';
                        if (value.length > 5) value = value.slice(0, 5);
                        setCard({ ...card, expiry: value });
                      }}
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
                <div className="md:flex-1 mt-4 md:mt-0">
                  <label className="block body-2-regular text-base-gray-400 mb-1">CVC</label>
                  <input
                    className="w-[343px] md:w-[384.5px] h-[48px] md:h-[48px] md:rounded-[4px] bg-base-gray-100 border border-base-gray-200 rounded-md px-3 py-2 text-sm placeholder-base-gray-300 outline-none"
                    placeholder="CVC"
                    value={card.cvc}
                    onChange={e => setCard({ ...card, cvc: e.target.value })}
                  />
                </div>
              </div>
            </form>
          )}

          {/* QR Code Tab */}
          {tab === "qr" && (
            <div className="px-4 mt-4 flex flex-col items-center text-gray-400 w-full md:ml-[120px]">
              <div className="bg-[#232B47] rounded py-10 md:w-[793px] md:h-[104px] flex items-center justify-center w-full">
                QR Code Payment
              </div>
              <div className="mt-2 text-xs text-center w-full">
                Scan QR code to pay
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}