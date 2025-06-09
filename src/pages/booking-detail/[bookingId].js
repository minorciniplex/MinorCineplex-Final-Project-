  import { useRouter } from 'next/router';
  import { useEffect, useState } from 'react';
  import { supabase } from '@/utils/supabase';
  import Head from 'next/head';
  import axios from 'axios';

  export default function BookingDetailPage() {
    const router = useRouter();
    const { bookingId } = router.query;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log(booking);
    useEffect(() => {
      const fetchBookingHistory = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get('/api/booking/booking-history-for-share?user_id=7855208a-eccc-4e97-bcae-95967ebb9d94');
          if (response.data.data && response.data.data.length > 0) {
            setBooking(response.data.data[0]);
          } else {
            setError('ไม่พบข้อมูลการจอง');
          }
        } catch (error) {
          console.error('Error fetching booking history:', error);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
          setLoading(false);
        }
      };

      if (bookingId) {
        fetchBookingHistory();
      }
    }, [bookingId]);

    return (
      <>
        {booking && (
          <Head>
            <title>{booking.movie.title} | Booking Detail</title>
            <meta property="og:title" content={`จองตั๋วหนังที่ ${booking.cinema.name}`} />
            <meta property="og:description" content={`ดูหนังที่ ${booking.cinema.name} วันที่ ${booking.showtime.date} เวลา ${booking.showtime.start_time} ที่นั่ง ${Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}`} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`https://6881-171-97-99-145.ngrok-free.app/booking-detail/${booking.booking_id}`} />
            <meta property="og:image" content={booking.movie.poster_url} />
          </Head>
        )}
        
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#070C1B] text-white">
          {loading ? (
            <div className="text-xl">กำลังโหลด...</div>
          ) : error ? (
            <div className="text-xl text-red-500">{error}</div>
          ) : booking ? (
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold mb-4">Booking Detail</h2>
              <div className="bg-[#10162A] rounded-lg p-6 mb-6 w-full max-w-xs">
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-base-gray-300">
                    <span>•</span>
                    <span>{booking.movie.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base-gray-300">
                    <span>•</span>
                    <span>{booking.showtime.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base-gray-300">
                    <span>•</span>
                    <span>{booking.showtime.start_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base-gray-300">
                    <span>•</span>
                    <span>{booking.cinema.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base-gray-300">
                    <span>•</span>
                    <img src={booking.movie.poster_url} alt={booking.movie.title}  />
                  </div>
                </div>
                <div className="border-t border-[#232B47] my-2"></div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between">
                    <span>Selected Seat</span>
                    <span className="font-bold">{Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold">THB{booking.total_price}</span>
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
          ) : (
            <div>ไม่พบข้อมูลการจอง</div>
          )}
        </div>
      </>
    );
  }     