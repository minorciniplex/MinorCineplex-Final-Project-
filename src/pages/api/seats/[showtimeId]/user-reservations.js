import { createSupabaseServerClient } from '@/utils/supabaseCookie'; 

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported' 
    });
  }

  try {
    const { showtimeId } = req.query;
    
    // Create Supabase client with server-side cookies
    const supabase = createSupabaseServerClient(req, res);
    
    // Get authenticated user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      });
    }

    const userId = user.id;

    if (!showtimeId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Showtime ID is required' 
      });
    }

    // Execute the Supabase query
    const { data, error } = await supabase
      .from('booking_seats')
      .select(`
        seat_id,
        showtime_id,
        seats (
          seat_id,
          reserved_by,
          row,
          seat_number,
          showtime_id
        ),
        bookings (
          booking_id,
          reserved_until,
          user_id
        )
      `)
      .eq('showtime_id', showtimeId)
      .eq('bookings.user_id', userId);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ 
        error: 'Database Error',
        message: 'Failed to fetch user reservations',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }

    // Format the data as in your example
    const detailedData = data
      .filter(item => item.seats && item.bookings)
      .map(item => ({
        seat_id: item.seats.seat_id,
        booking_id: item.bookings.booking_id,
        reserved_by: item.seats.reserved_by,
        reserved_until: item.bookings.reserved_until,
        row: item.seats.row,
        seat_number: item.seats.seat_number,
        showtime_id: item.seats.showtime_id
      }));

    // Optional: Filter out expired reservations
    const now = new Date();
    const activeReservations = detailedData.filter(reservation => {
      if (!reservation.reserved_until) return true;
      return new Date(reservation.reserved_until) > now;
    });

    return res.status(200).json(activeReservations);

  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}