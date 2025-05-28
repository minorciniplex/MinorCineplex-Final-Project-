import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { seatId, showtimeId, userId, reservationTime } = req.body;

  try {
    // Calculate reservation expiry time
    const reservedUntil = new Date(Date.now() + reservationTime).toISOString();

    // Check if seat is available
    const { data: existingSeat, error: fetchError } = await supabase
      .from("seats")
      .select("*")
      .eq("seat_id", seatId)
      .eq("showtime_id", showtimeId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // If seat doesn't exist, create it as reserved
    if (!existingSeat) {
      const seatData = parseSeatId(seatId);
      const { error: insertError } = await supabase.from("seats").insert({
        seat_id: seatId,
        row: seatData.row,
        seat_number: seatData.number,
        showtime_id: showtimeId,
        seat_status: "reserved",
        reserved_by: userId,
        reserved_until: reservedUntil,
      });

      if (insertError) throw insertError;
    } else {
      // Check if seat is available or reserved by the same user
      if (
        existingSeat.status === "booked" ||
        (existingSeat.status === "reserved" &&
          existingSeat.reserved_by !== userId)
      ) {
        return res.status(400).json({
          success: false,
          error: "Seat is not available",
        });
      }

      // Update existing seat
      const { error: updateError } = await supabase
        .from("seats")
        .update({
          seat_status: "reserved",
          reserved_by: userId,
          reserved_until: reservedUntil,
        })
        .eq("seat_id", seatId)
        .eq("showtime_id", showtimeId);

      if (updateError) throw updateError;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error reserving seat:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reserve seat",
    });
  }
}

function parseSeatId(seatId) {
  const row = seatId.charAt(0);
  const number = parseInt(seatId.slice(1));
  return { row, number };
}
