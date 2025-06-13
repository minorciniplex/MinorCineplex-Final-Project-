import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "POST") {
    const { showtimeId, seatNumber, sumPrice } = req.body;

    // Validate input
    if (!showtimeId || !seatNumber || !Array.isArray(seatNumber) || seatNumber.length === 0) {
      return res.status(400).json({ error: "Missing required fields or invalid seat data" });
    }

    // Validate sumPrice
    if (!sumPrice || isNaN(sumPrice) || sumPrice <= 0) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    try {
      // Check if any seat is already booked/reserved
      for (const seat of seatNumber) {
        // Extract row and seat number from seat format (e.g., "E7" -> row: "E", seat: "7")
        const row = seat.charAt(0);
        const seatNum = seat.slice(1);

        // Check if seat exists and is already taken
        const { data: existingSeat, error: seatCheckError } = await supabase
          .from("seats")
          .select("*")
          .eq("row", row)
          .eq("seat_number", seatNum)
          .eq("showtime_id", showtimeId);

        if (seatCheckError) {
          return res.status(500).json({ 
            error: "Database error while checking seat availability",
            details: process.env.NODE_ENV === 'development' ? seatCheckError : undefined
          });
        }

        // If seat exists and is booked/reserved by someone else
        if (existingSeat && existingSeat.length > 0) {
          const existingSeatData = existingSeat[0];
          if (existingSeatData.seat_status === 'booked' || 
              (existingSeatData.seat_status === 'reserved' && existingSeatData.reserved_by !== user.id)) {
            return res.status(409).json({ error: `Seat ${seat} is already booked` });
          }
        }
      }

      // Create a new booking
      const bookingData = {
        user_id: user.id,
        showtime_id: showtimeId,
        booking_date: new Date().toISOString(),
        total_price: parseFloat(sumPrice),
        status: "reserved",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      };

      const { data: bookingResult, error: bookingError } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select();

      if (bookingError) {
        return res.status(500).json({ 
          error: "Failed to create booking",
          details: process.env.NODE_ENV === 'development' ? bookingError : undefined
        });
      }

      if (!bookingResult || bookingResult.length === 0) {
        return res.status(500).json({ error: "Booking created but no data returned" });
      }

      const bookingId = bookingResult[0].booking_id;

      // Insert all seats - check if they already exist and update them
      const seatUpdatePromises = seatNumber.map(async (seat) => {
        const row = seat.charAt(0);
        const seatNum = seat.slice(1);
        
        // First try to update existing seat
        const { data: updateResult, error: updateError } = await supabase
          .from("seats")
          .update({
            seat_status: "reserved",
            reserved_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('seat_id', seat)
          .eq('showtime_id', showtimeId)
          .select();

        // If no existing seat found, create new one
        if (!updateResult || updateResult.length === 0) {
          const { data: insertResult, error: insertError } = await supabase
            .from("seats")
            .insert({
              seat_id: seat,
              row: row,
              seat_number: parseInt(seatNum),
              showtime_id: showtimeId,
              seat_status: "reserved",
              reserved_by: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();

          if (insertError) {
            throw insertError;
          }
          return insertResult[0];
        }

        if (updateError) {
          throw updateError;
        }
        return updateResult[0];
      });

      let seatData;
      try {
        seatData = await Promise.all(seatUpdatePromises);
      } catch (seatError) {
        // Try to cleanup the booking
        await supabase.from("bookings").delete().eq("booking_id", bookingId);
        return res.status(500).json({ 
          error: "Failed to reserve seats",
          details: process.env.NODE_ENV === 'development' ? seatError : undefined
        });
      }

      // Insert booking_seats junction records
      const bookingSeatInserts = seatNumber.map(seat => ({
        seat_id: seat,
        showtime_id: showtimeId,
        booking_id: bookingId,
        created_at: new Date().toISOString()
      }));

      const { data: bookingSeatData, error: bookingSeatError } = await supabase
        .from("booking_seats")
        .insert(bookingSeatInserts)
        .select();

      if (bookingSeatError) {
        // Cleanup on error  
        await supabase.from("seats").delete().eq("showtime_id", showtimeId).eq("reserved_by", user.id);
        await supabase.from("bookings").delete().eq("booking_id", bookingId);
        return res.status(500).json({ 
          error: "Failed to create booking-seat association",
          details: process.env.NODE_ENV === 'development' ? bookingSeatError : undefined
        });
      }

      return res.status(201).json({ 
        data: bookingResult,
        seatData: seatData,
        bookingSeatData: bookingSeatData,
        message: "Booking created successfully"
      });

    } catch (error) {
      return res.status(500).json({ 
        error: "Internal Server Error",
        message: "An unexpected error occurred while processing your booking",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler);