import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';

export default function PaymentQR() {
  const router = useRouter();
  const { chargeId, amount, bookingId } = router.query;
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState(null);
  const [booking, setBooking] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);

  useEffect(() => {
    if (!chargeId) return;
    fetch(`/api/get-qr?chargeId=${chargeId}`)
      .then(res => res.json())
      .then(data => setQr(data.qr));
  }, [chargeId]);

  // ดึงข้อมูล booking เพื่อใช้ reserved_until
  useEffect(() => {
    if (!bookingId) return;
    
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/debug/booking-detail-debug?bookingId=${bookingId}`);
        const data = await response.json();
        if (data.booking) {
          setBooking(data.booking);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      }
    };
    
    fetchBooking();
  }, [bookingId]);

  // คำนวณเวลาที่เหลือจาก reserved_until
  useEffect(() => {
    if (!booking?.reserved_until) return;
    
    const updateTimeRemaining = () => {
      const now = new Date();
      const reservedUntil = new Date(booking.reserved_until);
      const diff = reservedUntil - now;
      
      if (diff <= 0) {
        setTimeRemaining('00:00');
        setShowExpiredPopup(true);
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    // อัพเดททันที
    updateTimeRemaining();
    
    // อัพเดททุกวินาที
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [booking]);

  // Poll สถานะ Omise charge ทุก 5 วินาที
  useEffect(() => {
    if (!chargeId || !bookingId) return;
    const interval = setInterval(async () => {
      const res = await fetch('/api/check-promptpay-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chargeId }),
      });
      const data = await res.json();
      setStatus(data.status);
      if (data.status === 'successful' || data.status === 'paid') {
        clearInterval(interval);
        console.log('Payment successful! Calling mark-paid API...');
        
        // เรียก mark-paid API เพื่ออัพเดทสถานะ booking
        try {
          const markPaidResponse = await fetch('/api/booking/mark-paid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              bookingId: bookingId,
              paymentIntentId: chargeId,
              paymentMethod: 'promptpay'
            }),
          });
          
          const markPaidResult = await markPaidResponse.json();
          console.log('Mark-paid API result:', markPaidResult);
          
          if (!markPaidResponse.ok) {
            console.error('Mark-paid API error:', markPaidResult);
            // ยังคงไป success page แม้ mark-paid จะล้มเหลว
          }
        } catch (error) {
          console.error('Error calling mark-paid API:', error);
          // ยังคงไป success page แม้ mark-paid จะล้มเหลว
        }
        
        router.replace(`/payment-success?bookingId=${bookingId}`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [chargeId, bookingId, router]);

  return (
    <div className="min-h-screen bg-[#101525] text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-[68px] ">
        <div className="bg-base-gray-100 rounded-[4px] py-10 px-8 flex flex-col items-center justify-center w-full max-w-md mt-8">
        <div className="mb-4 text-base-gray-200 text-center">Time remaining: <span className="text-brand-blue-200 font-bold">{timeRemaining || '00:00'}</span></div>
        {qr && (
          <img
            src={qr}
            alt="PromptPay QR"
            width={220}
            height={220}
            className="mx-auto"
          />
        )}
        <div className="mt-6 text-white font-bold text-lg text-center">Minor Cineplex Public limited company</div>
        <div className="mt-2 text-white font-bold text-2xl text-center">THB{amount}</div>
        {status && <div className="mt-4 text-white">สถานะ: {status}</div>}
        </div>
      </div>

      {/* Booking Expired Popup */}
      {showExpiredPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div 
            className="bg-[#232B47] rounded-lg flex flex-col items-center justify-center relative"
            style={{
              width: '343px',
              height: '178px',
              padding: '16px',
              gap: '16px'
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowExpiredPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center flex-1 justify-center">
              <h3 className="text-white text-lg font-bold mb-2">Booking expired</h3>
              <p className="text-gray-300 text-sm leading-5">
                You did not complete the checkout process in time, please start again
              </p>
            </div>

            {/* OK Button */}
            <button 
              onClick={() => {
                setShowExpiredPopup(false);
                router.push('/'); // หรือหน้าที่ต้องการให้กลับไป
              }}
              className="w-full bg-[#4E7BEE] text-white font-medium py-3 rounded-[4px] hover:bg-[#3E6BDE] transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 