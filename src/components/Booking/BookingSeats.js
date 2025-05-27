import React, { use } from "react";
import { useState, useEffect } from "react";
import AvailableIcon from "../Seats/Seat_Available";
import BookedIcon from "../Seats/Seat_Booked";
import ReservedIcon from "../Seats/Seat_Reserved";
import SelectedIcon from "../Seats/Seat_Selected";

const ROWS = ["E", "D", "C", "B", "A"];
const SEATS_PER_ROW = 10;

// ตัวอย่างสถานะที่นั่ง (สามารถแก้ไขหรือรับจาก props/api ได้)
const demoSeats = ROWS.map((row, rowIdx) => ({
  row,
  seats: Array.from({ length: SEATS_PER_ROW }, (_, i) => {
    // ตัวอย่าง: ที่นั่ง 3, 4 ของแต่ละแถวเป็น booked, reserved
    let status = "available";
    if (i === 2) status = "booked";
    if (i === 3) status = "reserved";
    return {
      number: (i + 1).toString(),
      status,
    };
  }),
}));

function BookingSeats({ setBookingSeat, setSumPrice }) {
  const tests = ["A1", "B2", "C3"]; // ตัวอย่างที่นั่งที่ถูกเลือก
  const [selectedSeats, setSelectedSeats] = useState([]);
  useEffect(() => {
    // อัพเดทที่นั่งที่ถูกเลือก

    setBookingSeat(selectedSeats.map((s) => `${s.row}${s.number}`));
    // คำนวณราคารวม
    setSumPrice(selectedSeats.length * 150);
  }, [selectedSeats]);

  const isSelected = (row, number) =>
    selectedSeats.some((s) => s.row === row && s.number === number);

  const handleSeatClick = (row, number, status) => {
    if (status !== "available") return;
    const already = isSelected(row, number);
    let newSelected;
    if (already) {
      newSelected = selectedSeats.filter(
        (s) => !(s.row === row && s.number === number)
      );
    } else {
      newSelected = [...selectedSeats, { row, number }];
    }
    setSelectedSeats(newSelected);
  };

  return (
    <>
      <div className="w-full sm:basis-3/4 py-10 px-4 sm:py-0 sm:px-0">
        <div className="bg-gradient-to-r from-[#2C344E] to-[#516199] rounded-t-[80px] items-center flex justify-center text-[8px] sm:text-base py-[4.67px] sm:py-[10px] text-[--base-gray-400]">
          screen
        </div>

        {/* ผังที่นั่ง */}
        <div className="flex flex-col gap-4 sm:gap-[30px] items-center mt-[28px] sm:my-[60px]">
          {demoSeats.map((rowObj, rowIdx) => (
            <div
              key={rowIdx}
              className="flex flex-row text-[7.47px] sm:text-base text-[--base-gray-300] items-center gap-9 sm:gap-[138px]"
            >
              {/* ฝั่งซ้าย */}

              <div className="flex flex-row gap-3 sm:gap-6 items-center">
                <span className="text-left font-bold">{rowObj.row}</span>
                {rowObj.seats.slice(0, 5).map((seat, idx) => {
                  const selected = isSelected(rowObj.row, seat.number);
                  let icon = <AvailableIcon />;
                  if (selected) icon = <SelectedIcon />;
                  else if (seat.status === "booked") icon = <BookedIcon />;
                  else if (seat.status === "reserved") icon = <ReservedIcon />;
                  return (
                    <div
                      key={idx}
                      className="w-[18.6px] h-[18.6px] sm:w-10 sm:h-10 rounded-md flex items-center justify-center cursor-pointer"
                      onClick={() =>
                        handleSeatClick(rowObj.row, seat.number, seat.status)
                      }
                    >
                      {icon}
                    </div>
                  );
                })}
              </div>
              {/* ฝั่งขวา */}
              <div className="flex flex-row gap-3 sm:gap-6 items-center">
                {rowObj.seats.slice(5, 10).map((seat, idx) => {
                  const selected = isSelected(rowObj.row, seat.number);
                  let icon = <AvailableIcon />;
                  if (selected) icon = <SelectedIcon />;
                  else if (seat.status === "booked") icon = <BookedIcon />;
                  else if (seat.status === "reserved") icon = <ReservedIcon />;
                  return (
                    <div
                      key={idx}
                      className="w-[18.6px] h-[18.6px] sm:w-10 sm:h-10 rounded-md flex items-center justify-center cursor-pointer"
                      onClick={() =>
                        handleSeatClick(rowObj.row, seat.number, seat.status)
                      }
                    >
                      {icon}
                    </div>
                  );
                })}
                <span className="text-right font-bold">{rowObj.row}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10 border-t-2 border-[--base-gray-100] pt-2 sm:py-4 mt-7 sm:mt-0">
          <div className="bg-[--base-gray-100] rounded-sm py-3 px-4 text-[--base-gray-400] text-2xl font-bold items-center w-[88px]">
            Hall 1
          </div>
          <div className="grid grid-cols-2 sm:flex sm:gap-10 sm:grid-cols-none gap-y-8 gap-x-8 sm:gap-y-0 text-[--base-gray-400]">
            <div className="flex flex-row sm:flex-wrap gap-4 items-center">
              <AvailableIcon />
              <p className="basis-24">Avilable Seat THB150</p>
            </div>
            <div className="flex flex-row sm:flex-wrap gap-4 items-center">
              <BookedIcon />
              <p>Booed Seat</p>
            </div>
            <div className="flex flex-row sm:flex-wrap gap-4 items-center">
              <ReservedIcon />
              <p>Reserved Seat</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookingSeats;
