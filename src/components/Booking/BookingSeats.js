import React, { use } from "react";
import { useState, useEffect } from "react";

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
  seats = [{ row: "A", seats: [{ number: 1, status: "available" }, { number: 2, status: "available" }, { number: 3, status: "booked" }] }
, { row: "B", seats: [{ number: 1, status: "available" }, { number: 2, status: "reserved" }, { number: 3, status: "available" }] },
  { row: "C", seats: [{ number: 1, status: "booked" }, { number: 2, status: "available" }, { number: 3, status: "available" }] },
  { row: "D", seats: [{ number: 1, status: "booked" }, { number: 2, status: "booked" }, { number: 3, status: "available" }] },
  { row: "E", seats: [{ number: 1, status: "available" }, { number: 2, status: "available" }, { number: 3, status: "available" }] },
  { row: "F", seats: [{ number: 1, status: "available" }, { number: 2, status: "available" }, { number: 3, status: "available" }] },
  { row: "G", seats: [{ number: 1, status: "available" }, { number: 2, status: "available" }, { number: 3, status: "available" }] },
  { row: "H", seats: [{ number: 1, status: "available" }, { number: 2, status: "available" }, { number: 3, status: "available" }] }],



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

  return (
    <div className="flex flex-col items-center gap-4">
      {seats.map((rowObj, rowIdx) => (
        <div key={rowObj.row} className="flex items-center gap-2">
          <span className="text-[--base-gray-300] w-4">{rowObj.row}</span>
          {rowObj.seats.map((seat, seatIdx) => {
            const selected = isSelected(rowObj.row, seat.number);
            let status = seat.status;
            if (selected) status = "selected";
            return (
              <button
                key={seatIdx}
                className={`w-8 h-8 rounded ${seatStatusColor[status]} flex items-center justify-center`}
                disabled={seat.status !== "available"}
                onClick={() => handleSeatClick(rowObj.row, seat.number, seat.status)}
                type="button"
              >
                {seat.number}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default BookingSeats;
