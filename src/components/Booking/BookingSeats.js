import React, { use } from "react";
import { useState, useEffect } from "react";
import AvailableIcon from "../Seats/Seat_Available";
import BookedIcon from "../Seats/Seat_Booked";
import ReservedIcon from "../Seats/Seat_Reserved";

// ตัวอย่างข้อมูลที่นั่ง (ควรรับจาก props หรือ API)
// const seats = [
//   { row: "A", seats: [ { number: 1, status: "available" }, ... ] }, ...
// ];

const seatStatusColor = {
  available: "bg-[#6CA8FF] hover:bg-[#4B90E2] cursor-pointer", // ฟ้า
  booked: "bg-[#3B4153] cursor-not-allowed", // เทาเข้ม
  reserved: "bg-[#2B3550] cursor-not-allowed", // น้ำเงินเข้ม
  selected: "bg-[#6CA8FF] border-2 border-white relative", // ฟ้า + ขอบขาว
};

function BookingSeats({
  seats = [
    {
      row: "A",
      seats: [
        { number: "1", status: "available" },
        { number: "2", status: "available" },
        { number: "3", status: "booked" },
        { number: "4", status: "booked" },
        { number: "5", status: "available" },
      ],
    },
    {
      row: "B",
      seats: [
        { number: "1", status: "available" },
        { number: "2", status: "reserved" },
        { number: "3", status: "available" },
        { number: "4", status: "available" },
        { number: "5", status: "available" },
      ],
    },
    {
      row: "C",
      seats: [
        { number: "1", status: "available" },
        { number: "2", status: "available" },
        { number: "3", status: "available" },
        { number: "4", status: "booked" },
        { number: "5", status: "available" },
      ],
    },
    {
      row: "D",
      seats: [
        { number: "1", status: "available" },
        { number: "2", status: "available" },
        { number: "3", status: "reserved" },
        { number: "4", status: "available" },
        { number: "5", status: "booked" },
      ],
    },
    {
      row: "E",
      seats: [
        { number: "1", status: "available" },
        { number: "2", status: "available" },
        { number: "3", status: "available" },
        { number: "4", status: "available" },
        { number: "5", status: "available" },
      ],
    },
  ], // ตัวอย่างข้อมูลที่นั่ง

  selectedSeats = ["A1"], // ที่นั่งที่ถูกเลือก
  onSelect = () => {},
  priceTest = 150,
  hall = 1,
  setBookingSeat,
  setSumPrice,
}) {
  useEffect(() => {
    // อัพเดทที่นั่งที่ถูกเลือก
    setBookingSeat(selectedSeats);
    // คำนวณราคารวม
    setSumPrice(selectedSeats.length * priceTest);
  }, []);

  // Helper เช็คว่า seat ถูกเลือก
  const isSelected = (row, number) =>
    selectedSeats.some((s) => s.row === row && s.number === number);

  // handle click
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
    onSelect(newSelected);
  };

  const seatIcon = {
    available: <AvailableIcon />,
    booked: <BookedIcon />,
    reserved: <ReservedIcon />,
    selected: <AvailableIcon />, // หรือจะเปลี่ยน icon สำหรับ selected ก็ได้
  };

  return (
    <>
      <div className="w-full sm:basis-3/4">
        <div className="bg-gradient-to-r from-[#2C344E] to-[#516199] rounded-t-[80px] items-center flex justify-center py-[10px] text-[--base-gray-400]">
          screen
        </div>

        <div className="sm:py-[60px]">
          <div className="flex flex-row justify-between sm:gap-[30px]">
            {/* ฝั่งซ้าย (A, B, C) */}
            <div className="flex flex-col items-center space-y-[30px]">
              {seats.slice(0, 3).map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-6 items-center">
                  {/* ตัวหนังสือแถวอยู่ซ้าย */}
                  <span className="w-4 text-left">{row.row}</span>
                  {row.seats.map((seat, seatIndex) => {
                    const selected = isSelected(row.row, seat.number);
                    const status = selected ? "selected" : seat.status;
                    return (
                      <div
                        key={seatIndex}
                        className={`w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold ${seatStatusColor[status]}`}
                        onClick={() =>
                          handleSeatClick(row.row, seat.number, seat.status)
                        }
                      >
                        {seatIcon[status]}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* ฝั่งขวา (D, E) */}
            <div className="flex flex-col items-center space-y-[30px]">
              {seats.slice(3, 5).map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-6 items-center">
                  {/* ตัวหนังสือแถวอยู่ขวา */}
                  {row.seats.map((seat, seatIndex) => {
                    const selected = isSelected(row.row, seat.number);
                    const status = selected ? "selected" : seat.status;
                    return (
                      <div
                        key={seatIndex}
                        className={`w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold ${seatStatusColor[status]}`}
                        onClick={() =>
                          handleSeatClick(row.row, seat.number, seat.status)
                        }
                      >
                        {seatIcon[status]}
                      </div>
                    );
                  })}
                  <span className="w-4 text-right">{row.row}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-10 border-t-2 border-[--base-gray-100] py-4">
          <div className="bg-[--base-gray-100] rounded-sm py-3 px-4 text-[--base-gray-400] text-2xl font-bold">
            Hall 1
          </div>
          <div className="flex flex-wrap gap-4 ">
            <AvailableIcon />
            <p>Avilable Seat THB150</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <BookedIcon />
            <p>Booed Seat</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <ReservedIcon />
            <p>Reserved Seat</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookingSeats;
