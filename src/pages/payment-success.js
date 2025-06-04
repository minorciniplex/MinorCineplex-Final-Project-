import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070C1B] text-white">
      <div className="flex flex-col items-center">
        <div className="bg-green-500 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">Booking success</h2>
        <div className="bg-[#10162A] rounded-lg p-6 mb-6 w-full max-w-xs">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2 text-base-gray-300">
              <span>•</span>
              <span>{booking.cinema_name}</span>
            </div>
            <div className="flex items-center gap-2 text-base-gray-300">
              <span>•</span>
              <span>{booking.show_date}</span>
            </div>
            <div className="flex items-center gap-2 text-base-gray-300">
              <span>•</span>
              <span>{booking.show_time}</span>
            </div>
            <div className="flex items-center gap-2 text-base-gray-300">
              <span>•</span>
              <span>{booking.hall}</span>
            </div>
          </div>
          <div className="border-t border-[#232B47] my-2"></div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between">
              <span>Selected Seat</span>
              <span className="font-bold">{Array.isArray(booking.seat) ? booking.seat.join(', ') : booking.seat}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment method</span>
              <span className="font-bold">{booking.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-bold">THB{booking.total}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded border border-white text-white bg-transparent hover:bg-white hover:text-[#070C1B] transition"
          >
            Back to home
          </button>
          <button
            onClick={() => router.push(`/booking-detail/${booking.booking_id || booking.id}`)}
            className="px-6 py-2 rounded bg-brand-blue-200 text-white hover:bg-brand-blue-100 transition"
          >
            Booking detail
          </button>
        </div>
        <div className="mt-2">
          <a href="#" className="text-brand-blue-200 underline flex items-center gap-1" onClick={e => { e.preventDefault(); setShowShare(v => !v); }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share this booking
          </a>
        </div>
        {showShare && (
          <div className="mt-4 bg-[#232B47] rounded-lg p-4 flex flex-col items-center w-full max-w-xs shadow-lg">
            <div className="mb-2 font-bold text-white text-center">Share Booking</div>
            <div className="flex gap-4 justify-center">
              <button onClick={handleShareLine} className="flex flex-col items-center">
                <Image src={"/icons/line.svg"} alt="LINE" width={32} height={32} />
                <span className="text-xs mt-1">LINE</span>
              </button>
              <button onClick={handleShareMessenger} className="flex flex-col items-center">
                <Image src={"/icons/messenger.svg"} alt="Messenger" width={32} height={32} />
                <span className="text-xs mt-1">Messenger</span>
              </button>
              <button onClick={handleShareFacebook} className="flex flex-col items-center">
                <Image src={"/icons/facebook.svg"} alt="Facebook" width={32} height={32} />
                <span className="text-xs mt-1">Facebook</span>
              </button>
              <button onClick={handleShareTwitter} className="flex flex-col items-center">
                <Image src={"/icons/twitter.svg"} alt="Twitter" width={32} height={32} />
                <span className="text-xs mt-1">Twitter</span>
              </button>
              <button onClick={handleCopyLink} className="flex flex-col items-center">
                <Image src={"/icons/link.svg"} alt="Copy link" width={32} height={32} />
                <span className="text-xs mt-1">Copy link</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 