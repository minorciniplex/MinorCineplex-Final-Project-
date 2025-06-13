import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useStatus } from "@/context/StatusContext";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SharePage from "@/pages/share-page";
import Image from "next/image";
import toast from "react-hot-toast";
import Button from "@/components/Button";

const BookingHistory = () => {
  const router = useRouter();
  const { isLoggedIn, user } = useStatus();
  const [bookingHistory, setBookingHistory] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showShare, setShowShare] = useState(false);

  // Infinite scroll states
  const [allBookings, setAllBookings] = useState([]);
  const [displayedBookings, setDisplayedBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const ITEMS_PER_PAGE = 2; // จำนวนรายการต่อการโหลด
  const observer = useRef();

  const [shareBooking, setShareBooking] = useState(null);

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

  // Load more items
  const loadMore = useCallback(() => {
    if (loading || !hasMore) {
      return;
    }

    setLoading(true);

    // จำลองการ delay เหมือน API call
    setTimeout(() => {
      const nextIndex = currentIndex + ITEMS_PER_PAGE;
      const newItems = allBookings.slice(currentIndex, nextIndex);

      if (newItems.length > 0) {
        setDisplayedBookings((prev) => {
          const updated = [...prev, ...newItems];
          return updated;
        });
        setCurrentIndex(nextIndex);
      }

      // เช็คว่ามีข้อมูลเหลือหรือไม่
      if (nextIndex >= allBookings.length) {
        setHasMore(false);
      }

      setLoading(false);
    }, 500); // ลด loading time เป็น 1 วินาที
  }, [allBookings, currentIndex, loading, hasMore]);

  // Intersection Observer callback - แก้ไขให้ทำงานถูกต้อง
  const lastBookingElementRef = useCallback(
    (node) => {
      if (loading) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            loadMore();
          }
        },
        {
          // เพิ่ม threshold เพื่อให้ trigger ง่ายขึ้น
          threshold: 0.9,
          rootMargin: "0px 0px 100px 0px", // เพิ่ม rootMargin เพื่อให้ trigger ก่อนถึง bottom
        }
      );

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore, loadMore]
  );

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const openCancelModal = () => {
    setShowModal(false);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancellationReason("");
    setShowModal(true);
  };

  const handleCancelBooking = async () => {
    try {
      if (!selectedBooking || !selectedBooking.booking_id) {
        toast.error("Booking information not found", {
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        });
        return;
      }

      // ตรวจสอบสถานะการจองก่อนส่ง request
      if (selectedBooking.status === "cancelled") {
        // ปิด modal
        setShowCancelModal(false);
        setCancellationReason("");
        setSelectedBooking(null);

        // Redirect ไปหน้า cancellation successful ด้วย refund amount
        const refundAmount = selectedBooking.total_price || 0;
        router.push(`/cancellation-successful?refund=${refundAmount}`);
        return;
      }

      if (!cancellationReason.trim()) {
        toast.error("Please select a reason for cancellation", {
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        });
        return;
      }

      // Debug: ข้อมูลที่จะส่งไป
      const requestData = {
        bookingId: selectedBooking.booking_id,
        cancellationReason: cancellationReason,
      };

      const response = await axios.post(
        "/api/booking/cancel-booking-with-notifications",
        requestData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        const responseData = response.data.data || {};
        const refundAmount = responseData.refundAmount || 0;
        const refundPercentage = responseData.refundPercentage || 0;

        // รีเฟรชข้อมูลทั้งหมด
        const historyResponse = await axios.get("/api/booking/booking-history");
        const newBookings = historyResponse.data.data;

        // รีเซ็ตข้อมูล infinite scroll
        setAllBookings(newBookings);
        setDisplayedBookings(newBookings.slice(0, ITEMS_PER_PAGE));
        setCurrentIndex(ITEMS_PER_PAGE);
        setHasMore(newBookings.length > ITEMS_PER_PAGE);

        setShowCancelModal(false);
        setCancellationReason("");
        setSelectedBooking(null);

        // Redirect ไปหน้า cancellation successful
        router.push(`/cancellation-successful?refund=${refundAmount}`);
      } else {
        toast.error("Cancellation failed", {
          duration: 5000,
          style: {
            background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
            color: "#fff",
            padding: "20px",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxWidth: "420px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      console.error("Error details:", error.response?.data);

      // Debug: ข้อมูล error ที่ละเอียด

      // จัดการ error แต่ละประเภทแยกกัน
      const handleError = (error) => {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || error.message;

        switch (status) {
          case 400:
            // Bad Request - รวมถึง booking already cancelled
            if (errorMessage?.toLowerCase().includes("already cancelled")) {
              // ปิด modal
              setShowCancelModal(false);
              setCancellationReason("");
              setSelectedBooking(null);

              // Redirect ไปหน้า cancellation successful ด้วย refund amount
              const refundAmount = selectedBooking.total_price || 0;
              router.push(`/cancellation-successful?refund=${refundAmount}`);
            } else if (errorMessage?.toLowerCase().includes("missing")) {
              toast.error("Incomplete information, please try again", {
                duration: 4000,
                style: {
                  background:
                    "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "#fff",
                  padding: "16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                },
              });
            } else {
              toast.error(`Invalid data: ${errorMessage}`, {
                duration: 5000,
                style: {
                  background:
                    "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "#fff",
                  padding: "16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                },
              });
            }
            break;

          case 401:
            // Unauthorized
            toast.error("Please log in again", {
              duration: 6000,
              style: {
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                color: "#fff",
                padding: "20px",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                maxWidth: "420px",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#8B5CF6",
              },
            });

            // Redirect to login after delay
            setTimeout(() => {
              window.location.href = "/auth/login";
            }, 2000);
            break;

          case 403:
            // Forbidden
            toast.error("You do not have permission to cancel this booking", {
              duration: 5000,
              style: {
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                color: "#fff",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
            });
            break;

          case 404:
            // Not Found
            toast.error("Booking to cancel not found", {
              duration: 5000,
              style: {
                background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                color: "#fff",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
            });

            // รีเฟรชข้อมูลเพราะการจองอาจถูกลบไปแล้ว
            setTimeout(async () => {
              try {
                const historyResponse = await axios.get(
                  "/api/booking/booking-history",
                  {
                    withCredentials: true,
                  }
                );
                setBookingHistory(historyResponse.data.data);
                setShowCancelModal(false);
                setCancellationReason("");
                setSelectedBooking(null);
              } catch (refreshError) {
                console.error(
                  "Error refreshing booking history:",
                  refreshError
                );
              }
            }, 1000);
            break;

          case 500:
            // Server Error
            toast.error("System error occurred, please try again later", {
              duration: 6000,
              style: {
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                color: "#fff",
                padding: "20px",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                maxWidth: "420px",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#EF4444",
              },
            });
            break;

          default:
            // Network error หรือ error อื่นๆ
            if (error.code === "NETWORK_ERROR" || !error.response) {
              toast.error(
                "Unable to connect to server, please check your internet connection",
                {
                  duration: 8000,
                  style: {
                    background:
                      "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                    color: "#fff",
                    padding: "20px",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    maxWidth: "420px",
                  },
                  iconTheme: {
                    primary: "#fff",
                    secondary: "#DC2626",
                  },
                }
              );
            } else {
              // Generic error
              toast.error(
                `An error occurred: ${errorMessage || "Unknown cause"}`,
                {
                  duration: 6000,
                  style: {
                    background:
                      "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                    color: "#fff",
                    padding: "20px",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    maxWidth: "420px",
                  },
                  iconTheme: {
                    primary: "#fff",
                    secondary: "#EF4444",
                  },
                }
              );
            }
            break;
        }
      };

      // เรียกใช้ฟังก์ชันจัดการ error
      handleError(error);
    }
  };

  useEffect(() => {
    const fetchBookingHistory = async () => {
      setInitialLoading(true);
      try {
        const response = await axios.get("/api/booking/booking-history", {
          withCredentials: true,
        });
        const bookings = response.data.data || [];

        // เก็บข้อมูลทั้งหมด
        setAllBookings(bookings);
        setBookingHistory(bookings); // เก็บไว้เพื่อ backward compatibility

        // แสดงเฉพาะข้อมูลหน้าแรก
        const initialItems = bookings.slice(0, ITEMS_PER_PAGE);
        setDisplayedBookings(initialItems);
        setCurrentIndex(ITEMS_PER_PAGE);

        // เช็คว่ามีข้อมูลเหลือหรือไม่
        setHasMore(bookings.length > ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching booking history:", error);
        setHasMore(false);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBookingHistory();
  }, []);

  return (
    <div className="w-full md:max-w md:w-2/3 text-white md:px-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 px-4 md:px-0">
        <h1 className="text-white text-2xl md:text-4xl font-bold">
          Booking History
        </h1>
        
        <div className="flex justify-center md:justify-end w-full md:w-auto">
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard/cancellation-history")}
            className="!text-white !py-2 !rounded-lg !font-medium !transition-colors !text-sm md:!text-base !w-auto !my-4"
          >
            View Cancellation History
          </Button>
        </div>
      </div>

      {/* Initial Loading */}
      {initialLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-gray-400 mt-2">Loading booking history...</p>
        </div>
      ) : displayedBookings.length > 0 ? (
        <div>
          {displayedBookings.map((booking, index) => {
            // เพิ่ม ref ให้กับ element สุดท้าย ONLY
            const isLast = index === displayedBookings.length - 1;

            return (
              <div
                key={`${booking.booking_id}-${index}`}
                ref={isLast && hasMore ? lastBookingElementRef : null}
                className="bg-[#070C1B] rounded-lg p-4 md:p-6 mb-4 cursor-pointer"
                onClick={() => handleBookingClick(booking)}
              >
                {/* Movie Information Section */}
                <div className="flex flex-col md:flex-row md:mb-6 gap-4 md:gap-6">
                  {/* Movie Poster */}
                  <div className="flex">
                    <div className="w-20 md:w-auto h-28 md:h-auto rounded-lg overflow-hidden flex-shrink-0">
                      {booking.movie.poster_url ? (
                        <Image
                          src={booking.movie.poster_url}
                          alt={booking.movie.title}
                          width={80}
                          height={112}
                          className="w-full h-full object-cover md:w-[120px] md:h-[160px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-600 rounded-lg flex items-center justify-center text-xs text-gray-400">
                          Movie Poster
                        </div>
                      )}
                    </div>

                    {/* Movie Details */}
                    <div className="flex flex-col justify-center ml-4 md:ml-6">
                      <h2 className="text-white text-lg md:text-xl mb-2 md:mb-3 font-semibold">
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
                  <div className="mt-4 md:mt-0 text-[--base-gray-300] text-sm md:ml-auto">
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
                <div className="flex flex-col md:flex-row justify-center border-t border-[--base-gray-100] mt-4 pt-4 md:pt-6 md:pb-0 md:m-0 gap-4">
                  <div className="flex flex-col md:flex-row md:flex-none gap-4 md:gap-0">
                    <div className="bg-[--base-gray-100] py-3 px-4 rounded-sm text-center text-nowrap">
                      <div className="text-[--base-gray-400] font-bold">
                        {booking.seats.length} Tickets
                      </div>
                    </div>
                    <div className="w-full flex flex-col md:ml-6 text-sm gap-2 md:gap-1">
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
                  <div className="flex justify-end md:justify-end items-center md:ml-auto mt-4 md:mt-0">
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
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-12">
          No booking history found.
        </p>
      )}

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-[#070C1B] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[--base-gray-100] rounded-lg w-full max-w-md md:w-2/5 md:max-w-none relative border-[--base-gray-200] border max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex relative items-center">
              <h3 className="flex-1 text-xl font-bold py-3 px-4 text-center">
                Booking Detail
              </h3>
              <div className="flex absolute right-0 gap-4 pr-4 w-auto ">
                {/* Share Button */}
                <div>
                  <button
                    className="text-gray-400 w-6 h-6 flex items-center justify-center"
                    onClick={() => setShowShare(!showShare)}
                  >
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
                  {showShare && (
                    <div className="relative">
                      <div
                        className="fixed inset-0 z-100 bg-black/50"
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setShowShare(false);
                          }
                        }}
                      >
                        <div className="flex justify-center items-center mt-[330px]">
                          <SharePage bookingData={selectedBooking} />
                        </div>
                      </div>
                    </div>
                  )}
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
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 6L18 18"
                        stroke="#C8CEDD"
                        stroke-linecap="round"
                        strokeLinejoin="round"
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
                    <Image
                      src={
                        selectedBooking.movie.poster_url ||
                        "/placeholder-poster.png"
                      }
                      alt={selectedBooking.movie.title}
                      width={144}
                      height={144}
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
                            {selectedBooking.showtime.start_time
                              ? selectedBooking.showtime.start_time
                                  .slice(0, 5)
                                  .replace(":", ":")
                              : ""}
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
                      {selectedBooking.booking_id
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
                      <span className="">
                        {selectedBooking.payment.payment_method}
                      </span>
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
                    <div className="text-[--brand-red] font-bold">
                      {selectedBooking?.couple_discount?.discount_amount
                        ? `-THB${selectedBooking.couple_discount.discount_amount}`
                        : "-"}
                    </div>
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
                      {selectedBooking?.couple_discount?.discount_amount
                        ? `THB${
                            selectedBooking.total_price -
                            selectedBooking.couple_discount.discount_amount
                          }`
                        : `THB${selectedBooking.total_price}`}
                    </div>
                  </div>
                </div>
              </div>
              {/* Cancel Button */}
              <div className="flex items-end">
                {selectedBooking.status === "cancelled" ? (
                  <div className="w-max md:h-min bg-gray-600 border border-gray-500 text-gray-400 py-6 px-10 rounded-sm font-bold mt-6 md:mt-0 cursor-not-allowed">
                    Already Cancelled
                  </div>
                ) : (
                  <button
                    onClick={openCancelModal}
                    className="w-max md:h-min bg-transparent border border-[--base-gray-300] text-white py-3 px-10 rounded-sm font-bold mt-6 md:mt-0 hover:bg-[--base-gray-700] transition-colors"
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-[#070C1B] bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#21263F] rounded-lg w-full max-w-lg md:w-[654px] md:max-w-none relative border border-[--base-gray-200] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6">
              <div className="w-6 h-6"></div>
              <h3 className="headline-4 text-white">Cancel booking</h3>
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

            <div className="py-6 px-4">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side - Reason Selection */}
                <div className="flex-1 mt-[-20px] md:mt-[0px] ">
                  <h4 className="text-white font-semibold mb-4">
                    Reason for cancellation
                  </h4>
                  <div className="space-y-3">
                    {[
                      "I had changed my mind",
                      "I found an alternative",
                      "The booking was created by accident",
                      "Other reasons",
                    ].map((reason) => (
                      <label
                        key={reason}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className="relative">
                          <input
                            type="radio"
                            name="cancellation-reason"
                            value={reason}
                            checked={cancellationReason === reason}
                            onChange={(e) =>
                              setCancellationReason(e.target.value)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              cancellationReason === reason
                                ? "border-white bg-white"
                                : "border-gray-400 bg-transparent"
                            }`}
                          >
                            {cancellationReason === reason && (
                              <div className="w-[16px] h-[16px] rounded-full bg-[#ffffff]"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-[--base-gray-300] text-sm">
                          {reason}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right Side - Booking Summary */}
                <div className="w-full lg:w-[300px] bg-[#070C1B] rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[--base-gray-300] text-sm">
                        Ticket x{selectedBooking.seats.length}
                      </span>
                      <span className="text-white font-bold">
                        THB{selectedBooking.total_price}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[--base-gray-300] text-sm">
                        Coupon
                      </span>
                      <span className="text-[--brand-red] font-bold">
                        {selectedBooking?.couple_discount?.discount_amount
                          ? `-THB${selectedBooking.couple_discount.discount_amount}`
                          : "-"}
                      </span>
                    </div>

                    <hr className="border-[--base-gray-200]" />

                    <div className="flex justify-between items-center">
                      <span className="text-[--base-gray-300] text-sm">
                        Total
                      </span>
                      <span className="text-white font-bold">
                        {selectedBooking?.couple_discount?.discount_amount
                          ? `THB${
                              selectedBooking.total_price -
                              selectedBooking.couple_discount.discount_amount
                            }`
                          : `THB${selectedBooking.total_price}`}
                      </span>
                    </div>

                    <hr className="border-[--base-gray-200]" />

                    <div className="flex justify-between items-center">
                      <span className="text-[--base-gray-300] text-sm font-bold">
                        Total refund
                      </span>
                      <span className="text-white font-bold">
                        {selectedBooking?.couple_discount?.discount_amount
                          ? `THB${
                              selectedBooking.total_price -
                              selectedBooking.couple_discount.discount_amount
                            }`
                          : `THB${selectedBooking.total_price}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Text */}
              <div className="mt-6 text-[--base-gray-400] text-sm">
                <p>
                  Cancel booking before   {selectedBooking.showtime.start_time
                              ? selectedBooking.showtime.start_time
                                  .slice(0, 5)
                                  .replace(":", ":")
                              : ""}{" "}
                  {formatDate(selectedBooking.showtime.date)}, Refunds will be
                  done according to{" "}
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
                <Button
                  onClick={closeCancelModal}
                  variant="secondary"
                  className="!w-[112px] !h-[48px] !bg-transparent !border !border-[--base-gray-300] !text-white !rounded-md !font-bold hover:!bg-[--base-gray-100] !transition-colors"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCancelBooking}
                  disabled={!cancellationReason}
                  className="!w-[179px] !h-[48px]  disabled:!opacity-50 disabled:!cursor-not-allowed"
                >
                  Cancel booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
