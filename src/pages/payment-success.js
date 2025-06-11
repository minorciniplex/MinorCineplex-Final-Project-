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
import SharePage from '@/pages/share-page';

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

        // ดึงข้อมูล booking_seats
        const { data: seatData, error: seatError } = await supabase
          .from('booking_seats')
          .select('seat_id')
          .eq('booking_id', bookingData.booking_id);

        // ดึงข้อมูล payment (ใช้ maybeSingle แทน single เพื่อไม่ error เมื่อไม่มีข้อมูล)
        // เพิ่ม order by created_at desc เพื่อได้ payment ล่าสุด
        const { data: paymentData, error: paymentError } = await supabase
          .from('movie_payments')
          .select('payment_method, payment_details, status')
          .eq('booking_id', bookingData.booking_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('Seat data:', seatData);
        console.log('Payment data:', paymentData);
        console.log('Payment error:', paymentError);

        // แปลง payment method ให้แสดงผลถูกต้อง
        let displayPaymentMethod = 'ไม่ระบุ'; // เปลี่ยน default เป็น 'ไม่ระบุ'
        
        // ใช้ sessionStorage เป็นอันดับแรก
        const lastPaymentMethod = typeof window !== 'undefined' ? sessionStorage.getItem('lastPaymentMethod') : null;
        
        if (lastPaymentMethod) {
          console.log('Using payment method from sessionStorage:', lastPaymentMethod);
          displayPaymentMethod = lastPaymentMethod;
        } else if (paymentData?.payment_method) {
          const paymentMethod = paymentData.payment_method.toLowerCase();
          console.log('Original payment method from DB:', paymentData.payment_method);
          console.log('Lowercase payment method:', paymentMethod);
          
          switch (paymentMethod) {
            case 'omise_promptpay':
            case 'promptpay':
            case 'qr_code':
            case 'qr':
              displayPaymentMethod = 'QR Code';
              break;
            case 'card':
            case 'credit_card':
            case 'stripe':
            case 'credit card':
              displayPaymentMethod = 'Credit card';
              break;
            default:
              // ถ้าไม่ใช่ type ที่รู้จัก ให้ใช้ค่าจาก database โดยตรง
              displayPaymentMethod = paymentData.payment_method.replace(/_/g, ' ');
              // Capitalize first letter
              displayPaymentMethod = displayPaymentMethod.charAt(0).toUpperCase() + displayPaymentMethod.slice(1);
              break;
          }
        } else {
          // ถ้าไม่มีข้อมูล payment 
          if (bookingData.status === 'paid' || bookingData.status === 'booked') {
            // ใช้ QR Code เป็น default เพราะระบบใช้ QR Code เป็นหลัก
            displayPaymentMethod = 'QR Code';
          } else {
            displayPaymentMethod = 'ไม่ระบุ';
          }
        }

        console.log('Payment method from DB:', paymentData?.payment_method);
        console.log('Payment method from sessionStorage:', lastPaymentMethod);
        console.log('Display payment method:', displayPaymentMethod);

        console.log('=== DEBUG INFO ===');
        console.log('Booking ID:', bookingId);
        console.log('Booking data exists:', !!bookingData);
        console.log('Payment data exists:', !!paymentData);
        console.log('Payment method raw:', paymentData?.payment_method);
        console.log('Payment method from sessionStorage:', lastPaymentMethod);
        console.log('Display payment method final:', displayPaymentMethod);
        // console.log('Debug URL:', `http://localhost:3000/api/debug/payment-status?bookingId=${bookingId}`);
        
        // ล้าง sessionStorage หลังจากใช้เสร็จ
        if (typeof window !== 'undefined' && lastPaymentMethod) {
          sessionStorage.removeItem('lastPaymentMethod');
          console.log('Cleared lastPaymentMethod from sessionStorage');
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
    <div className="pt-[50px] flex flex-col items-center justify-center bg-[#101525] text-white">
      <Navbar />
      <div className="flex flex-col items-center mt-[40px] md:mt-[80px]">
        <div className="bg-brand-green rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <Image
            src={"/assets/images/done.png"}
            width={32}
            height={32}
            alt="Success" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-base-gray-300 mb-8 text-center">
          Your booking has been confirmed. Check your email for details.
        </p>

        {/* Booking Details Card */}
        <div className="bg-[#232B47] rounded-lg p-6 w-full max-w-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <FmdGoodIcon style={{ fontSize: 16 }} className="text-base-gray-300" />
              <span className="text-base-gray-300">{booking.cinema_name}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <CalendarMonthIcon style={{ fontSize: 16 }} className="text-base-gray-300" />
              <span className="text-base-gray-300">{booking.show_date}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <AccessTimeIcon style={{ fontSize: 16 }} className="text-base-gray-300" />
              <span className="text-base-gray-300">{booking.show_time}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <MeetingRoomIcon style={{ fontSize: 16 }} className="text-base-gray-300" />
              <span className="text-base-gray-300">{booking.hall}</span>
            </div>
          </div>

          <div className="border-t border-base-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base-gray-300">Movie:</span>
              <span className="text-white font-medium">{booking.movie_title}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-base-gray-300">Seats:</span>
              <span className="text-white font-medium">{booking.seat}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-base-gray-300">Payment Method:</span>
              <span className="text-white font-medium">{booking.payment_method}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-base-gray-300">Total:</span>
              <span className="text-white font-bold">THB{booking.total}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-md">
          <Button
            className="!w-full !h-[48px] !rounded-[4px]"
            onClick={() => router.push(`/booking-detail/${bookingId}`)}
          >
            View Booking Details
          </Button>
          
          <button
            className="w-full h-[48px] bg-transparent border border-base-gray-200 text-white rounded-[4px] hover:bg-base-gray-100 transition-colors"
            onClick={() => setShowShare(true)}
          >
            Share Booking
          </button>
          
          <button
            className="w-full h-[48px] bg-transparent text-base-gray-300 rounded-[4px] hover:text-white transition-colors"
            onClick={() => router.push('/')}
          >
            Back to Home
          </button>
        </div>
        <div className='text-white flex items-center justify-center cursor-pointer pt-[10px] relative' onClick={() => setShowShare(!showShare)}>
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
            <div className="relative">
              <SharePage 
                bookingData={booking}
                isSuccessPage={true} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 