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

export default function PaymentSuccess() {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

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
        if (paymentData?.payment_method) {
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
        console.log('Display payment method:', displayPaymentMethod);

        console.log('=== DEBUG INFO ===');
        console.log('Booking ID:', bookingId);
        console.log('Booking data exists:', !!bookingData);
        console.log('Payment data exists:', !!paymentData);
        console.log('Payment method raw:', paymentData?.payment_method);
        console.log('Display payment method final:', displayPaymentMethod);
        console.log('Debug URL:', `http://localhost:3000/api/debug/payment-status?bookingId=${bookingId}`);

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

  const url = typeof window !== 'undefined' ? `${window.location.origin}/booking-detail/${bookingId}` : '';
  const text = `Let's watch together! Join me & book now! ${url}`;
  const fbAppId = 'YOUR_FACEBOOK_APP_ID'; // ใส่ app id จริงถ้ามี

  const handleShareLine = () => {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank');
  };
  const handleShareMessenger = () => {
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=${fbAppId}&redirect_uri=${encodeURIComponent(url)}`, '_blank');
  };
  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };
  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    alert('คัดลอกลิงก์แล้ว');
  };

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
        <div className="mt-6">
          <a href="#" className=" body-1-medium text-white underline flex items-center gap-2 " onClick={e => { e.preventDefault(); setShowShare(v => !v); }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
            Share this booking
          </a>
        </div>
        {showShare && (
          <div className="w-[274px] h-[208px] mt-[-240px] bg-base-gray-100 rounded-[8px] p-4 flex flex-col items-center  shadow-lg 
                          md:w-[432px] md:h-[128px] md:p-4 md:shadow-[4px_4px_30px_rgba(0,0,0,0.5)] md:mt-[-170px]">
            <div className="mb-1 body-1-medium text-white text-center md:mb-4">Share Booking</div>
            
            {/* Mobile: 2 rows */}
            <div className="flex flex-col gap-4 md:hidden">
              {/* แถวแรก */}
              <div className="flex gap-4 justify-center">
                <Button variant="ghost" onClick={handleShareLine} className="flex flex-col items-center w-auto h-auto p-0">
                  <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                    <Image src={"/assets/images/Line.png"} alt="LINE" width={20} height={20} />
                  </div>
                  <span className="text-xs text-white">LINE</span>
                </Button>
                <Button variant="ghost" onClick={handleShareMessenger} className="flex flex-col items-center w-auto h-auto p-0">
                  <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                    <Image src={"/assets/images/Mesenger.png"} alt="Messenger" width={20} height={20} />
                  </div>
                  <span className="text-xs text-white">Messenger</span>
                </Button>
                <Button variant="ghost" onClick={handleShareFacebook} className="flex flex-col items-center w-auto h-auto p-0">
                  <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                    <Image src={"/assets/images/Facebook - Original.png"} alt="Facebook" width={20} height={20} />
                  </div>
                  <span className="text-xs text-white">Facebook</span>
                </Button>
              </div>
              {/* แถวสอง */}
              <div className="flex gap-4 justify-start mt-[-15px]">
                <Button variant="ghost" onClick={handleShareTwitter} className="flex flex-col items-center w-auto h-auto p-0">
                  <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                    <Image src={"/assets/images/Twitter - Original.png"} alt="Twitter" width={20} height={20} />
                  </div>
                  <span className="text-xs text-white">Twitter</span>
                </Button>
                <Button variant="ghost" onClick={handleCopyLink} className="flex flex-col items-center w-auto h-auto p-0">
                  <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                    <Image src={"/assets/images/Copy_light.png"} alt="Copy link" width={20} height={20} />
                  </div>
                  <span className="text-xs text-white">Copy link</span>
                </Button>
              </div>
            </div>

            {/* Desktop: 1 row */}
            <div className="hidden md:flex gap-2 justify-center md:mt-[-23px]">
              <Button variant="ghost" onClick={handleShareLine} className="flex flex-col items-center w-auto h-auto p-0">
                <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                  <Image src={"/assets/images/Line.png"} alt="LINE" width={20} height={20} />
                </div>
                <span className="text-xs text-white">LINE</span>
              </Button>
              <Button variant="ghost" onClick={handleShareMessenger} className="flex flex-col items-center w-auto h-auto p-0">
                <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                  <Image src={"/assets/images/Mesenger.png"} alt="Messenger" width={20} height={20} />
                </div>
                <span className="text-xs text-white">Messenger</span>
              </Button>
              <Button variant="ghost" onClick={handleShareFacebook} className="flex flex-col items-center w-auto h-auto p-0">
                <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                  <Image src={"/assets/images/Facebook - Original.png"} alt="Facebook" width={20} height={20} />
                </div>
                <span className="text-xs text-white">Facebook</span>
              </Button>
              <Button variant="ghost" onClick={handleShareTwitter} className="flex flex-col items-center w-auto h-auto p-0">
                <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                  <Image src={"/assets/images/Twitter - Original.png"} alt="Twitter" width={20} height={20} />
                </div>
                <span className="text-xs text-white">Twitter</span>
              </Button>
              <Button variant="ghost" onClick={handleCopyLink} className="flex flex-col items-center w-auto h-auto p-0">
                <div className="w-10 h-10 bg-base-gray-0 rounded-full flex items-center justify-center mb-2">
                  <Image src={"/assets/images/Copy_light.png"} alt="Copy link" width={20} height={20} />
                </div>
                <span className="text-xs text-white">Copy link</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 