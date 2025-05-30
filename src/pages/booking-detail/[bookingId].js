import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabase';

export default function BookingDetailPage() {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('booking_detail')
        .select('*')
        .eq('id', bookingId)
        .single();
      setBooking(data);
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!booking) return <div className="text-white">ไม่พบข้อมูลการจอง</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070C1B] text-white">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-4">Booking Detail</h2>
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
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded border border-white text-white bg-transparent hover:bg-white hover:text-[#070C1B] transition"
        >
          Back
        </button>
      </div>
    </div>
  );
} 