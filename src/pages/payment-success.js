import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import Navbar from '@/components/Navbar/Navbar';
import Button from '@/components/Button';
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SharePage from './share-page';
export default function PaymentSuccess() {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  console.log(booking);
  
  useEffect(() => {
    if (!bookingId) {
      console.log('No bookingId in query');
      return;
    }
    const fetchBooking = async () => {
      try {
        console.log('Fetching booking with ID:', bookingId);

        // ดึงข้อมูล booking พื้นฐานก่อน
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('booking_id', bookingId)
          .single();

        console.log('Basic booking data:', bookingData);
        console.log('Booking error:', bookingError);

        if (bookingError || !bookingData) {
          console.error('Failed to fetch booking:', bookingError);
          setLoading(false);
          return;
        }
        console.log(bookingData);
        
        // ดึงข้อมูล booking_seats
        const { data: seatData, error: seatError } = await supabase
          .from('booking_seats')
          .select('seat_id')
          .eq('booking_id', bookingData.booking_id);

        // ดึงข้อมูล payment (ใช้ maybeSingle แทน single เพื่อไม่ error เมื่อไม่มีข้อมูล)
        // เพิ่ม order by created_at desc เพื่อได้ payment ล่าสุด
        const { data: paymentData, error: paymentError } = await supabase
          .from('movie_payments')
          .select('payment_method, payment_details')
          .eq('booking_id', bookingData.booking_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('Seat data:', seatData);
        console.log('Payment data:', paymentData);
        console.log('Payment error:', paymentError);

        // แปลง payment method ให้แสดงผลถูกต้อง
        let displayPaymentMethod = 'Unknown'; // default แปลง
        if (paymentData?.payment_method) {
          switch (paymentData.payment_method) {
            case 'omise_promptpay':
            case 'promptpay':
            case 'qr_code':
              displayPaymentMethod = 'QR code';
              break;
            case 'card':
            case 'credit_card':
            case 'stripe':
              displayPaymentMethod = 'Credit card';
              break;
            default:
              displayPaymentMethod = paymentData.payment_method;
          }
        } else {
          // ถ้าไม่มี payment data แต่มา successful แสดงว่าเป็น QR code (เพราะ Credit card จะมี payment data)
          displayPaymentMethod = 'QR code';
        }

        // สร้าง formatted booking object
        const formattedBooking = {
          ...bookingData,
          cinema_name: 'Minor Cineplex Big C Phatum Thani', // Default value for now
          show_date: '05 Jun 2025', // Default value for now  
          show_time: '23:30', // Default value for now
          hall: 'Hall 3', // Default value for now
          movie_title: 'Home Sweet Home: Rebirth', // Default value for now
          seat: seatData?.map(s => s.seat_id).join(', ') || 'ไม่ระบุ',
          payment_method: displayPaymentMethod,
          total: bookingData.total_price || 0
        };

        console.log('Formatted booking:', formattedBooking);
        setBooking(formattedBooking);

      } catch (error) {
        console.error('Error in fetchBooking:', error);
      }
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!booking) return <div className="text-white">ไม่พบข้อมูลการจอง</div>;



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#101525] text-white">
      <Navbar />
      <div className="flex flex-col items-center mt-[40px] md:mt-[80px]">
        <div className="bg-brand-green rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <Image
            src={"/assets/images/done.png"}
            width={32}
            height={32}
            alt="Success" />
        </div>
        <h2 className="mb-4 headline-2">Booking success</h2>
        <div className=" w-[344px] h-[288px] bg-base-gray-0 rounded-[8px] p-6 mb-6 md:w-[386px] md:h-[288px]">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-[12px] body-2-regular text-base-gray-400 rounded">
              <FmdGoodIcon
                sx={{
                  color: "base-gray-200",
                  fontSize: "16px"
                }}
              />
              <span>{booking.cinema_name}</span>
            </div>
            <div className="flex items-center gap-[12px] body-2-regular text-base-gray-400">
              <CalendarMonthIcon
                sx={{
                  color: "base-gray-200",
                  fontSize: "16px"
                }}
              />
              <span>{booking.show_date}</span>
            </div>
            <div className="flex items-center gap-[12px] body-2-regular text-base-gray-400">
              <AccessTimeIcon
                sx={{
                  color: "base-gray-200",
                  fontSize: "16px"
                }}
              />
              <span>{booking.show_time}</span>
            </div>
            <div className="flex items-center gap-[12px] body-2-regular text-base-gray-400">
              <MeetingRoomIcon
                sx={{
                  color: "base-gray-200",
                  fontSize: "16px"
                }}
              />
              <span>{booking.hall}</span>
            </div>
          </div>
          <div className="border-t border-[#232B47] my-2"></div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between">
              <span className="body-2-regular text-base-gray-300">Selected Seat</span>
              <span className="body-1-medium text-white">{Array.isArray(booking.seat) ? booking.seat.join(', ') : booking.seat}</span>
            </div>
            <div className="flex justify-between">
              <span className="body-2-regular text-base-gray-300">Payment method</span>
              <span className="body-1-medium text-white">{booking.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="body-2-regular text-base-gray-300">Total</span>
              <span className="body-1-medium text-white">THB{booking.total}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-4">
          <Button
            className='!w-[170px] !h-[48px] md:!w-[185px] md:!h-[48px] !rounded-[4px]'
            variant="secondary"
            onClick={() => router.push('/')}
          >
            Back to home
          </Button>
          <Button
            className='!w-[173px] !h-[48px] md:!w-[185px] md:!h-[48px] !rounded-[4px]'
            variant="primary"
            onClick={() => router.push(`/booking-detail/${booking.booking_id || booking.id}`)}
          >
            Booking detail
          </Button>
        </div>
        <div className=' text-white flex items-center justify-center cursor-pointer pt-[10px]' onClick={() => setShowShare(!showShare)}>
          Share this booking
        </div>
        {showShare && <SharePage bookingData={booking} />}
      </div>
    </div>
  );
} 