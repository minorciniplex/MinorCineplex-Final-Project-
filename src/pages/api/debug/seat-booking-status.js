import { createSupabaseServerClient } from '@/utils/supabaseCookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);
    
    // Get all bookings
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get all seats with reservations
    const { data: seats, error: seatError } = await supabase
      .from('seats')
      .select('*')
      .not('reserved_by', 'is', null)
      .order('created_at', { ascending: false });

    // Get booking-seat relationships
    const { data: bookingSeats, error: bookingSeatError } = await supabase
      .from('booking_seats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('=== DEBUG SEAT BOOKING STATUS ===');
    console.log('Recent bookings:', bookings);
    console.log('Reserved seats:', seats);
    console.log('Booking-seat relationships:', bookingSeats);

    return res.status(200).json({
      success: true,
      data: {
        recent_bookings: bookings || [],
        reserved_seats: seats || [],
        booking_seat_relationships: bookingSeats || [],
        errors: {
          booking_error: bookingError,
          seat_error: seatError,
          booking_seat_error: bookingSeatError
        }
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 