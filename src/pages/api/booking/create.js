import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { movieId, showtimeId, seatIds, userId, totalPrice } = req.body;

  try {
    // Start a transaction
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        movie_id: movieId,
        showtime_id: showtimeId,
        user_id: userId,
        total_price: totalPrice,
        booking_status: "confirmed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Update all seats to booked status
    const { error: seatsError } = await supabase
      .from("seats")
      .update({
        status: "booked",
        booking_id: booking.id,
        reserved_by: null,
        reserved_until: null,
      })
      .in("seat_id", seatIds)
      .eq("reserved_by", userId);

    if (seatsError) {
      // Rollback booking if seat update fails
      await supabase.from("bookings").delete().eq("booking_id", booking.id);
      throw seatsError;
    }

    res.status(200).json({
      success: true,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create booking",
    });
  }
}
