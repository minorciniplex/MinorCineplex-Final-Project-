import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Navbar from '@/components/Navbar/Navbar';
import { useStatus } from '@/context/StatusContext';

export default function BookingDetailPage() {
  const router = useRouter();
  const { bookingId } = router.query;
  const [booking, setBooking] = useState(null);
  const [showtimeData, setShowtimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, user } = useStatus();

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        // Step 1: ดึงข้อมูล booking พื้นฐาน
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('booking_id', bookingId)
          .single();

        if (bookingError) {
          console.error('Booking error:', bookingError);
          setLoading(false);
          return;
        }

        if (!bookingData) {
          console.error('No booking found');
          setLoading(false);
          return;
        }

        // Step 2: ดึงข้อมูล showtime
        const { data: showtimeDataResult, error: showtimeError } = await supabase
          .from('showtimes')
          .select('*')
          .eq('showtime_id', bookingData.showtime_id)
          .single();
        
        setShowtimeData(showtimeDataResult);

        // Step 3: ดึงข้อมูล cinema
        let cinemaData = null;
        if (showtimeDataResult?.cinema_id) {
          const { data, error } = await supabase
            .from('cinemas')
            .select('*')
            .eq('cinema_id', showtimeDataResult.cinema_id)
            .single();
          cinemaData = data;
        }

        // Step 4: ดึงข้อมูล movie
        let movieData = null;
        if (showtimeDataResult?.movie_id) {
          const { data, error } = await supabase
            .from('movies')
            .select('*')
            .eq('movie_id', showtimeDataResult.movie_id)
            .single();
          movieData = data;
        }

        // Step 5: ดึงข้อมูล booking_seats
        const { data: bookingSeatsData, error: seatsError } = await supabase
          .from('booking_seats')
          .select('seat_id')
          .eq('booking_id', bookingData.booking_id);

        // Step 6: ดึงข้อมูล seats details
        let seatsData = [];
        if (bookingSeatsData && bookingSeatsData.length > 0) {
          const seatIds = bookingSeatsData.map(bs => bs.seat_id);
          const { data, error } = await supabase
            .from('seats')
            .select('*')
            .in('seat_id', seatIds);
          seatsData = data || [];
        }

        // Step 7: ดึงข้อมูล payment
        const { data: paymentData, error: paymentError } = await supabase
          .from('movie_payments')
          .select('payment_method, payment_details')
          .eq('booking_id', bookingData.booking_id);

        // แปลง payment method ให้แสดงผลถูกต้อง
        let displayPaymentMethod = 'QR code'; // default
        const rawPaymentMethod = paymentData?.[0]?.payment_method;
        if (rawPaymentMethod) {
          switch (rawPaymentMethod) {
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
              displayPaymentMethod = rawPaymentMethod;
          }
        }

        // รวมข้อมูลทั้งหมด
        const formattedBooking = {
          ...bookingData,
          cinema_name: cinemaData?.name || 'Minor Cineplex',
          show_date: showtimeDataResult?.show_date ? new Date(showtimeDataResult.show_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'ไม่ระบุ',
          show_time: showtimeDataResult?.show_time || 'ไม่ระบุ',
          hall: `Hall ${showtimeDataResult?.screen_number || '1'}`,
          movie_title: movieData?.title || 'ไม่ระบุ',
          movie_poster: movieData?.poster_url || 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          seat: seatsData.map(seat => `${seat.row}${seat.seat_number}`).join(', ') || 'ไม่ระบุ',
          payment_method: displayPaymentMethod,
          total: bookingData.total_price || 0
        };

        console.log('=== BOOKING DETAIL DATA ===');
        console.log('Booking data:', bookingData);
        console.log('Showtime data:', showtimeDataResult);
        console.log('Movie data:', movieData);
        console.log('Cinema data:', cinemaData);
        console.log('Seats data:', seatsData);
        console.log('Payment data:', paymentData);
        console.log('Formatted booking:', formattedBooking);
        setBooking(formattedBooking);

      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!booking) return <div className="text-white">ไม่พบข้อมูลการจอง</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#070C1B] text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Left Section - Movie Poster */}
            <div className="w-full lg:w-1/3">
              <h2 className="text-3xl font-bold mb-6 text-white">Booking Detail</h2>
              <div className="bg-transparent">
                <img
                  src={booking.movie_poster || 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'}
                  alt={booking.movie_title || 'Movie Poster'}
                  className="w-full max-w-[300px] rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg';
                  }}
                />
              </div>
            </div>

            {/* Right Section - Movie Details */}
            <div className="w-full lg:w-2/3">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4 text-white">{booking.movie_title}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-[#2A2F47] text-[#9CA3AF] px-3 py-1 rounded text-sm">Action</span>
                  <span className="bg-[#2A2F47] text-[#9CA3AF] px-3 py-1 rounded text-sm">Crime</span>
                  <span className="bg-[#2A2F47] text-[#6B7280] px-3 py-1 rounded text-sm">TH</span>
                </div>

                {/* Movie Information */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-[#9CA3AF]">
                    <span>•</span>
                    <span>{booking.cinema_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#9CA3AF]">
                    <span>•</span>
                    <span>{booking.show_date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#9CA3AF]">
                    <span>•</span>
                    <span>{booking.show_time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#9CA3AF]">
                    <span>•</span>
                    <span>{booking.hall}</span>
                  </div>
                </div>

                {/* Tickets and Seats Info */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="bg-[#4E7BEE] text-white px-4 py-2 rounded">
                    {booking.seat ? booking.seat.split(',').length : 2} Tickets
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] mr-2">Selected Seat</span>
                    <span className="text-white font-bold">{booking.seat}</span>
                  </div>
                </div>

                                 {/* Book More Seats Button */}
                 <button 
                   onClick={() => {
                     // ตรวจสอบ login ก่อน
                     if (!isLoggedIn) {
                       console.log('User not logged in, redirecting to login page');
                       router.push('/auth/login');
                       return;
                     }
                     
                     if (showtimeData?.showtime_id) {
                       router.push(`/booking/seats/${showtimeData.showtime_id}`);
                     } else {
                       // Fallback ถ้าไม่มี showtime_id
                       router.push('/');
                     }
                   }}
                   className="bg-[#4E7BEE] hover:bg-[#5a8cd9] text-white px-8 py-3 rounded-lg mb-8 transition-colors"
                 >
                   Book more seats
                 </button>

                {/* Movie Description */}
                <div className="text-[#9CA3AF] leading-relaxed">
                  <p className="mb-4">
                    With the help of allies Lt. Jim Gordon (Gary Oldman) and DA Harvey Dent (Aaron Eckhart), Batman (Christian Bale) has been able to keep a tight lid on crime in Gotham City.
                  </p>
                  <p>
                    But when a vile young criminal calling himself the Joker (Heath Ledger) suddenly throws the town into chaos, the caped Crusader begins to tread a fine line between heroism and vigilantism.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
////asdadasd