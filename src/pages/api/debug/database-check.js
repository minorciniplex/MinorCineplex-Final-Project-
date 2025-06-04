import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createSupabaseServerClient(req, res);
  const { showtimeId } = req.query;

  if (!showtimeId) {
    return res.status(400).json({ error: 'Showtime ID is required' });
  }

  try {
    console.log(`=== DATABASE DEBUG CHECK ===`);
    console.log(`Showtime ID: ${showtimeId}`);
    
    // Check all seats
    const { data: seats, error: seatsError } = await supabase
      .from('seats')
      .select('*')
      .eq('showtime_id', showtimeId);

    // Check all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('showtime_id', showtimeId);

    // Check booking_seats junction
    const { data: bookingSeats, error: bookingSeatsError } = await supabase
      .from('booking_seats')
      .select('*')
      .eq('showtime_id', showtimeId);

    const debugInfo = {
      timestamp: new Date().toISOString(),
      showtimeId,
      seats: {
        count: seats?.length || 0,
        data: seats || [],
        error: seatsError
      },
      bookings: {
        count: bookings?.length || 0,
        data: bookings || [],
        error: bookingsError
      },
      bookingSeats: {
        count: bookingSeats?.length || 0,
        data: bookingSeats || [],
        error: bookingSeatsError
      }
    };

    console.log('Database Debug Info:', JSON.stringify(debugInfo, null, 2));

    return res.status(200).json(debugInfo);

  } catch (error) {
    console.error('Debug API error:', error);
    return res.status(500).json({ 
      error: 'Debug failed',
      details: error.message
    });
  }
} 