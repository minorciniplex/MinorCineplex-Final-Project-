import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import Image from "next/image";
import Navbar from "@/components/Navbar/Navbar";
import Button from "@/components/Button";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SharePage from "@/pages/share-page";

export default function PaymentSuccess() {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  console.log(booking);

  useEffect(() => {
    if (!bookingId) {
      console.log("No bookingId in query");
      return;
    }
    const fetchBooking = async () => {
      try {
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select(
            `
            *,
            showtimes!inner (
              date,
              start_time,
              movie_id,
              screen_id,
              movies!inner (
                title,
                poster_url
              ),
              screens!inner (
                screen_number,
                price,
                cinemas!inner (
                  name,
                  address,
                  province
                )
              )
            ),
            booking_coupons (
              discount_amount
            )
          `
          )
          .eq("booking_id", bookingId)
          .single();

        if (bookingError || !bookingData) {
          console.error("Failed to fetch booking:", bookingError);
          setLoading(false);
          return;
        }

        // ดึงข้อมูล booking_seats
        const { data: seatData, error: seatError } = await supabase
          .from("booking_seats")
          .select("seat_id")
          .eq("booking_id", bookingData.booking_id);

        // ดึงข้อมูล payment (ใช้ maybeSingle แทน single เพื่อไม่ error เมื่อไม่มีข้อมูล)
        // เพิ่ม order by created_at desc เพื่อได้ payment ล่าสุด
        const { data: paymentData, error: paymentError } = await supabase
          .from("movie_payments")
          .select("payment_method, payment_details, status")
          .eq("booking_id", bookingData.booking_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // แปลง payment method ให้แสดงผลถูกต้อง
        let displayPaymentMethod = 'Not specified'; // เปลี่ยน default เป็น 'ไม่ระบุ'
        
        // ใช้ sessionStorage เป็นอันดับแรก
        const lastPaymentMethod =
          typeof window !== "undefined"
            ? sessionStorage.getItem("lastPaymentMethod")
            : null;

        if (lastPaymentMethod) {
          displayPaymentMethod = lastPaymentMethod;
        } else if (paymentData?.payment_method) {
          const paymentMethod = paymentData.payment_method.toLowerCase();
          
          switch (paymentMethod) {
            case "omise_promptpay":
            case "promptpay":
            case "qr_code":
            case "qr":
              displayPaymentMethod = "QR Code";
              break;
            case "card":
            case "credit_card":
            case "stripe":
            case "credit card":
              displayPaymentMethod = "Credit card";
              break;
            default:
              // ถ้าไม่ใช่ type ที่รู้จัก ให้ใช้ค่าจาก database โดยตรง
              displayPaymentMethod = paymentData.payment_method.replace(
                /_/g,
                " "
              );
              // Capitalize first letter
              displayPaymentMethod =
                displayPaymentMethod.charAt(0).toUpperCase() +
                displayPaymentMethod.slice(1);
              break;
          }
        } else {
          // ถ้าไม่มีข้อมูล payment
          if (
            bookingData.status === "paid" ||
            bookingData.status === "booked"
          ) {
            // ใช้ QR Code เป็น default เพราะระบบใช้ QR Code เป็นหลัก
            displayPaymentMethod = "QR Code";
          } else {
            displayPaymentMethod = 'ไม่ระบุ';
          }
        }

        // ล้าง sessionStorage หลังจากใช้เสร็จ
        if (typeof window !== "undefined" && lastPaymentMethod) {
          sessionStorage.removeItem("lastPaymentMethod");
          if (process.env.NODE_ENV === "development") {
            console.log("Cleared lastPaymentMethod from sessionStorage");
          }
        }

        // ฟอร์แมตวันที่และเวลา
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        };

        const formatTime = (timeString) => {
          return timeString ? timeString.substring(0, 5) : 'ไม่ระบุ';
        };

        // สร้าง formatted booking object ด้วยข้อมูลจริงจากฐานข้อมูล
        const formattedBooking = {
          ...bookingData,
          cinema_name: bookingData.showtimes.screens.cinemas.name || 'ไม่ระบุโรงภาพยนตร์',
          show_date: formatDate(bookingData.showtimes.date),
          show_time: formatTime(bookingData.showtimes.start_time),
          hall: `Hall ${bookingData.showtimes.screens.screen_number}`,
          movie_title: bookingData.showtimes.movies.title || 'ไม่ระบุชื่อหนัง',
          seat: seatData?.map(s => s.seat_id).join(', ') || 'ไม่ระบุ',
          payment_method: displayPaymentMethod,
          total: bookingData.total_price || 0,
          discount_amount:
            bookingData.booking_coupons?.length > 0
              ? bookingData.booking_coupons[0].discount_amount || 0
              : 0,
        };

        if (process.env.NODE_ENV === "development") {
          console.log("Formatted booking:", formattedBooking);
        }
        setBooking(formattedBooking);
      } catch (error) {
        console.error("Error in fetchBooking:", error);
      }
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!booking) return <div className="text-white">Booking information not found</div>;

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center bg-[#101525] text-white mt-[56px] md:mt-[100px]">
        <div className="flex flex-col items-center w-full p-4 md:w-[386px]">
          <div className="bg-brand-green rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <Image
              src={"/assets/images/Done.png"}
              width={32}
              height={32}
              alt="Success"
            />
          </div>
          <h1 className="text-3xl font-bold mb-12">Booking Success</h1>

          {/* Booking Details Card */}
          <div className="bg-[--base-gray-0] rounded-lg p-6 w-full  mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FmdGoodIcon
                  style={{ fontSize: 16 }}
                  className="text-base-gray-300"
                />
                <span className="text-base-gray-400">
                  {booking.cinema_name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CalendarMonthIcon
                  style={{ fontSize: 16 }}
                  className="text-base-gray-300"
                />
                <span className="text-base-gray-400">{booking.show_date}</span>
              </div>

              <div className="flex items-center gap-3">
                <AccessTimeIcon
                  style={{ fontSize: 16 }}
                  className="text-base-gray-300"
                />
                <span className="text-base-gray-400">{booking.show_time}</span>
              </div>

              <div className="flex items-center gap-3">
                <MeetingRoomIcon
                  style={{ fontSize: 16 }}
                  className="text-base-gray-300"
                />
                <span className="text-base-gray-400">{booking.hall}</span>
              </div>
            </div>

            <div className="border-t border-base-gray-100 mt-4 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base-gray-300">Selected Seat</span>
                <span className="text-white font-bold">{booking.seat}</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-base-gray-300">Payment Method</span>
                <span className="text-white font-bold">
                  {booking.payment_method}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-base-gray-300">Total</span>
                <span className="text-white font-bold">THB{booking.total-booking.discount_amount}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-4 w-full">
            <button
              className="w-1/2 h-[48px] bg-transparent border border-base-gray-200 text-white rounded-[4px] hover:bg-base-gray-100 transition-colors"
              onClick={() => router.push("/")}
            >
              Back to Home
            </button>
            <Button
              className="!w-1/2 h-[48px] !rounded-[4px] whitespace-nowrap"
              onClick={() => router.push(`/booking-detail/${bookingId}`)}
            >
              Booking Detail
            </Button>
          </div>
          <div
            className="text-white flex items-center justify-center cursor-pointer mt-12 md:mt-10 mb-10 md:mb-0 relative underline gap-[6px]"
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
            Share this booking
          </div>
          {/* popup box */}
          {showShare && (
            <div
              className="fixed inset-0 z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowShare(false);
                }
              }}
            >
              <div className="absolute md:-mt-20 lg:-mt-[200px] top-[482px] left-1/2 -translate-x-1/2 md:top-[762px]">
                <SharePage bookingData={booking} isSuccessPage={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
