import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { showtimeId } = req.query;

  try {
    const { data: seats, error } = await supabase
      .from('seats')
      .select('*')
      .eq('showtime_id', showtimeId)
      .order('row, seat_number');

    if (error) throw error;

    // Clean up expired reservations
    await cleanupExpiredReservations(showtimeId);

    res.status(200).json(seats || []);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
}

async function cleanupExpiredReservations(showtimeId) {
  const now = new Date().toISOString();
  
  await supabase
    .from('seats')
    .update({
      seat_status: 'available',
      reserved_by: null,
      reserved_until: null
    })
    .eq('showtime_id', showtimeId)
    .eq('seat_status', 'reserved')
    .lt('reserved_until', now);
}
