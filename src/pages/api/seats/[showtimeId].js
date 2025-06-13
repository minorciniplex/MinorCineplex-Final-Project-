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
      .order('row, seat_number');

    if (error) {
      throw error;
    }

    // If no seats found, return empty array
    if (!seats || seats.length === 0) {
      return res.status(200).json([]);
    }

    // Transform data to match frontend expectations
    const transformedSeats = seats.map(seat => ({
      id: seat.seat_id,
      row: seat.row,
      number: seat.seat_number,
      status: seat.seat_status || 'available',
      reserved_by: seat.reserved_by,
      reserved_until: null,
      showtime_id: seat.showtime_id,
      created_at: seat.created_at,
      updated_at: seat.updated_at
    }));
    
    res.status(200).json(transformedSeats);
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch seats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function cleanupExpiredReservations(supabase, showtimeId) {
  try {
    // Add 5 minutes buffer to avoid cleaning up reservations too early
    const now = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // Find expired bookings
    const { data: expiredBookings, error: selectError } = await supabase
      .from('bookings')
      .select('booking_id, user_id, reserved_until, created_at, status')
      .eq('showtime_id', showtimeId)
      .eq('status', 'reserved')
      .lt('reserved_until', now);

    if (selectError) {
      return;
    }

    if (expiredBookings && expiredBookings.length > 0) {
      // Update expired seats back to available
      for (const booking of expiredBookings) {
        await supabase
          .from('seats')
          .update({
            seat_status: 'available',
            reserved_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('showtime_id', showtimeId)
          .eq('reserved_by', booking.user_id);
      }

      // Delete expired bookings
      const expiredBookingIds = expiredBookings.map(b => b.booking_id);
      await supabase
        .from('bookings')
        .delete()
        .in('booking_id', expiredBookingIds);
    }
  } catch (error) {
    // Silent fail - cleanup operation shouldn't break the main request
  }
}