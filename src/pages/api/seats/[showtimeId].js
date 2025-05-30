import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { showtimeId } = req.query;

  if (!showtimeId) {
    return res.status(400).json({ error: 'Showtime ID is required' });
  }

  try {
    // Clean up expired reservations first
    await cleanupExpiredReservations(supabase, showtimeId);

    // Fetch seats with correct column names
    const { data: seats, error } = await supabase
      .from('seats')
      .select('*')
      .eq('showtime_id', showtimeId)
      .order('row, seat_number'); // Use actual database column name

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // If no seats found, return empty array
    if (!seats || seats.length === 0) {
      console.log(`No seats found for showtime ${showtimeId}, returning empty array`);
      return res.status(200).json([]);
    }

    // Transform data to match frontend expectations
    const transformedSeats = seats.map(seat => ({
      id: seat.seat_id,
      row: seat.row,
      number: seat.seat_number,
      status: seat.seat_status || 'available', // Handle different column names
      reserved_by: seat.reserved_by,
      reserved_until: seat.reserved_until,
      showtime_id: seat.showtime_id,
      created_at: seat.created_at,
      updated_at: seat.updated_at
    }));

    console.log(`Returning ${transformedSeats.length} seats for showtime ${showtimeId}`);
    res.status(200).json(transformedSeats);
    
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch seats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function cleanupExpiredReservations(supabase, showtimeId) {
  try {
    const now = new Date().toISOString();
    
    const { data: expiredSeats, error: selectError } = await supabase
      .from('seats')
      .select('seat_id')
      .eq('showtime_id', showtimeId)
      .eq('seat_status', 'reserved') // Use actual database column name
      .lt('reserved_until', now);

    if (selectError) {
      console.error('Error finding expired reservations:', selectError);
      return;
    }

    if (expiredSeats && expiredSeats.length > 0) {
      const { error: updateError } = await supabase
        .from('seats')
        .update({
          seat_status: 'available', // Use actual database column name
          reserved_by: null,
          reserved_until: null
        })
        .eq('showtime_id', showtimeId)
        .eq('seat_status', 'reserved')
        .lt('reserved_until', now);

      if (updateError) {
        console.error('Error cleaning up expired reservations:', updateError);
      } else {
        console.log(`Cleaned up ${expiredSeats.length} expired reservations for showtime ${showtimeId}`);
      }
    }
  } catch (error) {
    console.error('Error in cleanupExpiredReservations:', error);
    // Don't throw - this is a cleanup operation that shouldn't break the main request
  }
}