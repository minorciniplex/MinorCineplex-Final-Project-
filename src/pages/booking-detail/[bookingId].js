import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function BookingDetailPage() {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      // ดึงข้อมูล booking พร้อม showtime และ movie details
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          showtimes:showtime_id (
            show_date,
            show_time,
            cinemas:cinema_id (
              name,
              location
            ),
            movies:movie_id (
              title,
              poster_url
            ),
            screen_number
          ),
          booking_seats (
            seat_id,
            seats (
              row,
              seat_number
            )
          ),
          movie_payments (
            payment_method
          )
        `)
        .eq('booking_id', bookingId)
        .single();
      
      if (data) {
        // สร้าง object ข้อมูลสำหรับแสดงผล
        const formattedBooking = {
          ...data,
          cinema_name: data.showtimes?.cinemas?.name || 'ไม่ระบุ',
          show_date: data.showtimes?.show_date || 'ไม่ระบุ',
          show_time: data.showtimes?.show_time || 'ไม่ระบุ',
          hall: `Hall ${data.showtimes?.screen_number || '?'}`,
          movie_title: data.showtimes?.movies?.title || 'ไม่ระบุ',
          seat: data.booking_seats?.map(bs => `${bs.seats?.row}${bs.seats?.seat_number}`).join(', ') || 'ไม่ระบุ',
          payment_method: data.movie_payments?.[0]?.payment_method || 'Credit card',
          total: data.total_price || 0
        };
        setBooking(formattedBooking);
      }
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
              <span className="font-bold">{booking.seat}</span>
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