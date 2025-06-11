import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useStatus } from "@/context/StatusContext";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SharePage from "@/pages/share-page";
import Image from "next/image";

const BookingHistory = () => {
  const router = useRouter();
  const { isLoggedIn, user } = useStatus();
  const [bookingHistory, setBookingHistory] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showShare, setShowShare] = useState(false);
  console.log("Booking History:", bookingHistory);

  // Function to format date as "4 JUN 2025"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const openCancelModal = () => {
    setShowModal(false); // ปิด Booking Detail modal ก่อน
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancellationReason("");
    setShowModal(true); // เปิด Booking Detail modal กลับมา
  };

  const handleCancelBooking = async () => {
    try {
      console.log("Starting cancel booking process...");
      console.log("Selected booking:", selectedBooking);
      console.log("Cancellation reason:", cancellationReason);
      
      if (!selectedBooking || !selectedBooking.booking_id) {
        alert("ไม่พบข้อมูลการจอง");
        return;
      }

      if (!cancellationReason.trim()) {
        alert("กรุณาเลือกเหตุผลในการยกเลิก");
        return;
      }

      console.log("Sending request to API...");
      const response = await axios.post("/api/booking/cancel-booking-with-notifications", {
        bookingId: selectedBooking.booking_id,
        cancellationReason: cancellationReason
      });

      console.log("API Response:", response.data);
      console.log("API Response structure:", JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success) {
        // แสดงข้อความสำเร็จ
        const responseData = response.data.data || {};
        const refundAmount = responseData.refundAmount || 0;
        const refundPercentage = responseData.refundPercentage || 0;
        
        console.log("Extracted values:", { refundAmount, refundPercentage });
        alert(`การยกเลิกสำเร็จ!\nจำนวนเงินคืน: THB${refundAmount}\nเปอร์เซ็นต์คืน: ${refundPercentage}%`);
        
        console.log("Refreshing booking history...");
        // รีเฟรชข้อมูล booking history
        const historyResponse = await axios.get("/api/booking/booking-history");
        setBookingHistory(historyResponse.data.data);
        
        // ปิด modal
        setShowCancelModal(false);
        setCancellationReason("");
        setSelectedBooking(null);
      } else {
        alert("การยกเลิกไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      console.error("Error details:", error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || "เกิดข้อผิดพลาดในการยกเลิกการจอง";
      alert(`ไม่สามารถยกเลิกการจองได้: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const response = await axios.get("/api/booking/booking-history");
        setBookingHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching booking history:", error);
      }
    };

    fetchBookingHistory();
  }, []);

  return (
    <div className="max-w md:w-2/3 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pl-4 md:pl-0 gap-4">
        <h1 className="text-white text-4xl font-bold">
        Booking History
      </h1>
        <button
          onClick={() => router.push("/dashboard/cancellation-history")}
          className="bg-[--brand-red] hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
        >
          View Cancellation History
        </button>
      </div>
      {bookingHistory.length > 0 ? (
        <div>
          {bookingHistory.map((booking) => (
            <div
              key={booking.booking_id}
              className="bg-[#070C1B] max-w rounded-lg md:p-6 mb-4 cursor-pointer"
              onClick={() => handleBookingClick(booking)}
            >
              {/* Movie Information Section */}
              <div className="flex flex-col md:flex-row p-4 md:p-0 md:mb-6 gap-6 md:gap-0">
                {/* Movie Poster */}
                <div className="flex">
                  <div className="w-30 h-40 rounded-lg overflow-hidden flex-shrink-0">
                    {booking.movie.poster_url ? (
                      <Image
                        src={booking.movie.poster_url}
                        alt={booking.movie.title}
                        width={120}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-600 rounded-lg flex items-center text-xs text-gray-400">
                        Movie Poster
                      </div>
                    )}
                  </div>

                  {/* Movie Details */}
                  <div className="flex flex-col justify-center ml-6">
                    <h2 className="text-white text-xl mb-3 font-semibold">
                      {booking.movie.title}
                    </h2>

                    <div className="flex flex-col text-sm gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <FmdGoodIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400]">
                          {booking.cinema.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <CalendarMonthIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400]">
                          {formatDate(booking.showtime.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <AccessTimeIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400]">
                          {booking.showtime.start_time
                            ? booking.showtime.start_time
                                .slice(0, 5)
                                .replace(":", ":")
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <MeetingRoomIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400]">
                          Hall {booking.screen.screen_number}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="items-stretch text-[--base-gray-300] text-sm md:ml-auto">
                  <div className="flex gap-2 mb-1">
                    <div className="">Booking No.</div>
                    <div className="font-medium">
                      {booking.booking_id
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="">Booked date</div>
                    <div className="font-medium">
                      {formatDate(booking.booking_date)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="flex flex-col md:flex-row justify-center border-t border-[--base-gray-100] m-4 mt-0 py-4 md:pt-6 md:pb-0 md:m-0 gap-4">
                <div className="flex flex-row md:flex-none">
                  <div className="bg-[--base-gray-100] py-3 px-4 rounded-sm text-center text-nowrap">
                    <div className="text-[--base-gray-400] font-bold">
                      {booking.seats.length} Tickets
                    </div>
                  </div>
                  <div className="w-full flex flex-col ml-6 text-sm md:gap-1">
                    <div className="flex justify-between md:gap-4">
                      <span className="text-[--base-gray-300] inline-block">
                        Selected Seat
                      </span>
                      <span className="text-[--base-gray-400] font-medium">
                        {booking.seats.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between md:gap-4">
                      <span className="text-[--base-gray-300] inline-block">
                        Payment method
                      </span>
                      <span className="text-[--base-gray-400] font-medium">
                        {booking.payment.payment_method}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center md:ml-auto">
                  {booking.status === "booked" ? (
                    <div className="bg-[--brand-green] text-white py-[6px] px-4 rounded-full font-bold text-center">
                      Paid
                    </div>
                  ) : booking.status === "cancelled" ? (
                    <div className="bg-[#565F7E] text-white py-[6px] px-4 rounded-full font-bold text-center">
                      Cancelled
                    </div>
                  ) : booking.status === "completed" ? (
                    <div className="bg-[--brand-blue] text-white py-[6px] px-4 rounded-full font-bold text-center">
                      Complete
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-12">
          No booking history found.
        </p>
      )}

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-[#070C1B] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[--base-gray-100] rounded-lg w-[93%] md:w-2/5 relative border-[--base-gray-200] border">
            {/* Modal Header */}
            <div className="flex relative items-center">
              <h3 className="flex-1 text-xl font-bold py-3 px-4 text-center">
                Booking Detail
              </h3>
              <div className="flex absolute right-0 gap-4 pr-4 w-auto ">
                {/* Share Button */}
                <div>
                <button className="text-gray-400 w-6 h-6 flex items-center justify-center" onClick={() => setShowShare(!showShare)}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 3V2.5H20.5V3H20ZM10.3536 13.3536C10.1583 13.5488 9.84171 13.5488 9.64645 13.3536C9.45118 13.1583 9.45118 12.8417 9.64645 12.6464L10.3536 13.3536ZM19.5 11V3H20.5V11H19.5ZM20 3.5H12V2.5H20V3.5ZM20.3536 3.35355L10.3536 13.3536L9.64645 12.6464L19.6464 2.64645L20.3536 3.35355Z"
                      fill="white"
                    />
                    <path
                      d="M18 14.625V14.625C18 15.9056 18 16.5459 17.8077 17.0568C17.5034 17.8653 16.8653 18.5034 16.0568 18.8077C15.5459 19 14.9056 19 13.625 19H10C7.17157 19 5.75736 19 4.87868 18.1213C4 17.2426 4 15.8284 4 13V9.375C4 8.09442 4 7.45413 4.19228 6.94325C4.4966 6.1347 5.1347 5.4966 5.94325 5.19228C6.45413 5 7.09442 5 8.375 5V5"
                      stroke="white"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
                {showShare && <SharePage 
                bookingData={selectedBooking} />}
                </div>
                {/* Close Button */}
                <div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 w-6 h-6 flex items-center justify-center text-2xl"
                  style={{ fontSize: 24 }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="#C8CEDD"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="#C8CEDD"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
              </div>
            </div>

            {/* Movie Info in Modal */}
            <div className="p-4 bg-[--base-gray-0]">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="flex items-center gap-6 md:mb-6">
                  <div className="w-max h-36 bg-slate-600 rounded-lg flex items-center">
                    <img
                      src={
                        selectedBooking.movie.poster_url ||
                        "/placeholder-poster.png"
                      }
                      alt={selectedBooking.movie.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="text-white text-xl font-bold mb-3">
                      {selectedBooking.movie.title}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <FmdGoodIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400] text-sm font-normal">
                          {selectedBooking.cinema.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <CalendarMonthIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400] text-sm font-normal">
                          {formatDate(selectedBooking.showtime.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <AccessTimeIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400] text-sm font-normal">
                          {selectedBooking.showtime.start_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <MeetingRoomIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400] text-sm font-normal">
                          Hall {selectedBooking.cinema.hall || "1"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="items-center text-sm text-[--base-gray-300]">
                  <div className="flex mb-1 gap-2">
                    <div>Booking No.</div>
                    <div className="font-medium">
                      {(selectedBooking.booking_id)
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div>Booked date</div>
                    <div className="font-medium">
                      {formatDate(selectedBooking.booking_date)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="flex flex-col md:flex-row border-t border-[--base-gray-100] mt-4 pt-4 md:pt-6 md:pb-0 md:m-0 gap-4">
                <div className="flex flex-row gap-6 md:flex-none">
                  <div className="bg-[#21263F] py-3 px-4 rounded-sm text-center text-nowrap">
                    <div className="text-[--base-gray-400] font-bold">
                      {selectedBooking.seats.length} Tickets
                    </div>
                  </div>
                  <div className="flex-1 text-sm md:gap-1">
                    <div className="flex mb-1 justify-between md:gap-4">
                      <span className="text-[--base-gray-300]">
                        Selected Seat{" "}
                      </span>
                      <span className="">
                        {selectedBooking.seats.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between md:gap-4">
                      <span className="text-[--base-gray-300]">
                        Payment method{" "}
                      </span>
                      <span className="">{selectedBooking.payment.payment_method}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center md:ml-auto">
                  {selectedBooking.status === "booked" ? (
                    <div className="bg-[--brand-green] text-white py-[6px] px-4 rounded-full font-bold text-sm ml-auto md:ml-0">
                      Paid
                    </div>
                  ) : (
                    <div className="bg-[--brand-green] text-white py-1 px-3 rounded-full font-bold text-sm">
                      {selectedBooking.status}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-[#21263F] md:flex md:justify-between rounded-lg p-4 md:p-6">
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[--base-gray-400]">Payment method</div>
                  </div>
                  <div className="">
                    <div className="text-white font-bold text-right">
                      {selectedBooking.payment.payment_method}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-[--base-gray-400]">
                      Ticket x{selectedBooking.seats.length}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      THB{selectedBooking.total_price}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-[--base-gray-400]">Coupon</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[--brand-red] font-bold">-THB50</div>
                  </div>
                </div>
                <hr className="border-gray-600 my-3" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[--base-gray-400] font-bold">
                      Total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      THB{selectedBooking.total_price - 50}
                    </div>
                  </div>
                </div>
              </div>
              {/* Cancel Button */}
              <div className="flex items-end">
                <button 
                  onClick={openCancelModal}
                  className="w-max md:h-min bg-transparent border border-[--base-gray-300] text-white py-3 px-10 rounded-sm font-bold mt-6 md:mt-0"
                >
                  Cancel booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-[#070C1B] bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#21263F] rounded-lg w-[93%] md:w-[654px] relative border border-[--base-gray-200]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[--base-gray-200]">
              <h3 className="text-xl font-bold text-white">Cancel booking</h3>
              <button
                onClick={closeCancelModal}
                className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side - Reason Selection */}
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-4">Reason for cancellation</h4>
                  <div className="space-y-3">
                    {[
                      "I had changed my mind",
                      "I found an alternative", 
                      "The booking was created by accident",
                      "Other reasons"
                    ].map((reason) => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="cancellation-reason"
                          value={reason}
                          checked={cancellationReason === reason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-[--base-gray-300] text-sm">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right Side - Booking Summary */}
                <div className="w-full lg:w-[300px] bg-[#070C1B] rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[--base-gray-300] text-sm">Ticket x{selectedBooking.seats.length}</span>
                      <span className="text-white font-bold">THB{selectedBooking.total_price}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[--base-gray-300] text-sm">Coupon</span>
                      <span className="text-[--brand-red] font-bold">-THB50</span>
                    </div>
                    
                    <hr className="border-[--base-gray-200]" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[--base-gray-300] text-sm">Total</span>
                      <span className="text-white font-bold">THB{selectedBooking.total_price - 50}</span>
                    </div>
                    
                    <hr className="border-[--base-gray-200]" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[--base-gray-300] text-sm font-bold">Total refund</span>
                      <span className="text-white font-bold">THB{selectedBooking.total_price - 50}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Text */}
              <div className="mt-6 text-[--base-gray-400] text-sm">
                <p>
                  Cancel booking before 15:30 24 Jun 2024, Refunds will be done according to{" "}
                  <a 
                    href="/cancellation-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white underline cursor-pointer hover:text-[--brand-blue] transition-colors"
                  >
                    Cancellation Policy
                  </a>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 bg-transparent border border-[--base-gray-300] text-white py-3 px-6 rounded-md font-bold hover:bg-[--base-gray-100] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={!cancellationReason}
                  className="flex-1 bg-[#565F7E] text-white py-3 px-6 rounded-md font-bold hover:bg-[#6B7280] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
