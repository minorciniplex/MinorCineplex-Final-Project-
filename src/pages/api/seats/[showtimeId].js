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

    // Fetch seats with correct column names (removed reserved_until since it doesn't exist)
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
      reserved_until: null, // Set to null since this column doesn't exist in seats table
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
    // Get expired bookings (reserved_until is in bookings table, not seats)
    // Add 5 minutes buffer to avoid cleaning up reservations too early
    const now = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    console.log(`Checking for expired reservations for showtime ${showtimeId} at ${now} (with 5min buffer)`);
    
    // Find expired bookings - only ones that are truly expired
    const { data: expiredBookings, error: selectError } = await supabase
      .from('bookings')
      .select('booking_id, user_id, reserved_until, created_at, status')
      .eq('showtime_id', showtimeId)
      .eq('status', 'reserved')
      .lt('reserved_until', now);

    if (selectError) {
      console.error('Error finding expired reservations:', selectError);
      return;
    }

    console.log(`Found ${expiredBookings?.length || 0} truly expired bookings (with buffer):`, expiredBookings);

    if (expiredBookings && expiredBookings.length > 0) {
      // Update expired seats back to available
      for (const booking of expiredBookings) {
        console.log(`Cleaning up expired booking ${booking.booking_id} for user ${booking.user_id}, expired at ${booking.reserved_until}`);
        
        const { error: updateSeatsError } = await supabase
          .from('seats')
          .update({
            seat_status: 'available',
            reserved_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('showtime_id', showtimeId)
          .eq('reserved_by', booking.user_id);

        if (updateSeatsError) {
          console.error('Error updating expired seats:', updateSeatsError);
        }
      }

      // Delete expired bookings
      const expiredBookingIds = expiredBookings.map(b => b.booking_id);
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .in('booking_id', expiredBookingIds);

      if (deleteError) {
        console.error('Error deleting expired bookings:', deleteError);
      } else {
        console.log(`Successfully cleaned up ${expiredBookings.length} expired reservations for showtime ${showtimeId}`);
      }
    } else {
      console.log('No expired reservations found (with buffer)');
    }
  } catch (error) {
    console.error('Error in cleanupExpiredReservations:', error);
    // Don't throw - this is cleanup operation that shouldn't break the main request
  }
}