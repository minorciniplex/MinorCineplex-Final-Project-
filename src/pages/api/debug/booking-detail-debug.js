import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createSupabaseServerClient(req, res);
  const { bookingId } = req.query;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    console.log(`=== BOOKING DETAIL DEBUG ===`);
    console.log(`Booking ID: ${bookingId}`);
    
    // ตรวจสอบ booking พื้นฐาน
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    console.log('Basic booking:', booking);
    console.log('Booking error:', bookingError);

    let debugInfo = {
      timestamp: new Date().toISOString(),
      bookingId,
      booking: booking || null,
      errors: { booking: bookingError }
    };

    if (booking) {
      // ตรวจสอบ showtime
      const { data: showtime, error: showtimeError } = await supabase
        .from('showtimes')
        .select('*')
        .eq('showtime_id', booking.showtime_id)
        .single();

      // ตรวจสอบ cinema
      let cinema = null, cinemaError = null;
      if (showtime?.cinema_id) {
        const result = await supabase
          .from('cinemas')
          .select('*')
          .eq('cinema_id', showtime.cinema_id)
          .single();
        cinema = result.data;
        cinemaError = result.error;
      }

      // ตรวจสอบ movie
      let movie = null, movieError = null;
      if (showtime?.movie_id) {
        const result = await supabase
          .from('movies')
          .select('*')
          .eq('movie_id', showtime.movie_id)
          .single();
        movie = result.data;
        movieError = result.error;
      }

      // ตรวจสอบ booking_seats
      const { data: bookingSeats, error: bookingSeatsError } = await supabase
        .from('booking_seats')
        .select('*')
        .eq('booking_id', booking.booking_id);

      // ตรวจสอบ seats ที่เกี่ยวข้อง
      let seats = [], seatsError = null;
      if (bookingSeats && bookingSeats.length > 0) {
        const seatIds = bookingSeats.map(bs => bs.seat_id);
        const result = await supabase
          .from('seats')
          .select('*')
          .in('seat_id', seatIds);
        seats = result.data || [];
        seatsError = result.error;
      }

      // ตรวจสอบ movie_payments
      const { data: payments, error: paymentsError } = await supabase
        .from('movie_payments')
        .select('*')
        .eq('booking_id', booking.booking_id);

      debugInfo = {
        ...debugInfo,
        showtime,
        cinema,
        movie,
        bookingSeats,
        seats,
        payments,
        errors: {
          booking: bookingError,
          showtime: showtimeError,
          cinema: cinemaError,
          movie: movieError,
          bookingSeats: bookingSeatsError,
          seats: seatsError,
          payments: paymentsError
        }
      };
    }

    console.log('Complete Debug Info:', JSON.stringify(debugInfo, null, 2));
    return res.status(200).json(debugInfo);

  } catch (error) {
    console.error('Debug API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 