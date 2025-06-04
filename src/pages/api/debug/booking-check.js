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
    console.log(`=== BOOKING DEBUG CHECK ===`);
    console.log(`Booking ID: ${bookingId}`);
    
    // Check basic booking data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    console.log('Basic booking:', booking);
    console.log('Booking error:', bookingError);

    if (booking) {
      // Check related data
      const { data: bookingSeats, error: seatsError } = await supabase
        .from('booking_seats')
        .select('*')
        .eq('booking_id', booking.booking_id);

      const { data: payments, error: paymentsError } = await supabase
        .from('movie_payments')
        .select('*')
        .eq('booking_id', booking.booking_id);

      const debugInfo = {
        timestamp: new Date().toISOString(),
        bookingId,
        booking: booking || null,
        bookingSeats: bookingSeats || [],
        payments: payments || [],
        errors: {
          booking: bookingError,
          seats: seatsError,
          payments: paymentsError
        }
      };

      console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));
      return res.status(200).json(debugInfo);
    } else {
      return res.status(404).json({ 
        error: 'Booking not found',
        bookingId,
        bookingError 
      });
    }

  } catch (error) {
    console.error('Debug API error:', error);
    return res.status(500).json({ 
      error: 'Debug failed',
      details: error.message
    });
  }
} 