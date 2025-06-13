import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;
  const { bookingId } = req.query;

  if (req.method === "PUT") {
    const { showtimeId, seatNumber, sumPrice } = req.body;

    console.log("=== UPDATE BOOKING REQUEST ===");
    console.log("Booking ID:", bookingId);
    console.log("User ID:", user.id);
    console.log("Showtime ID:", showtimeId);
    console.log("Seat Numbers:", seatNumber);
    console.log("Total Price:", sumPrice);

    // Validate input
    if (!showtimeId || !seatNumber || !Array.isArray(seatNumber) || seatNumber.length === 0) {
      console.error("Validation failed: Missing required fields");
      return res.status(400).json({ error: "Missing required fields or invalid seat data" });
    }

    try {
      // 1. Verify the booking exists and belongs to the user
      const { data: existingBooking, error: bookingCheckError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .single();

      if (bookingCheckError || !existingBooking) {
        return res.status(404).json({ error: "Booking not found or unauthorized" });
      }

      // 2. Check if booking is still within the reservation time
      const reservedUntil = new Date(existingBooking.reserved_until);
      const now = new Date();
      
      if (now > reservedUntil) {
        return res.status(410).json({ error: "Booking reservation has expired" });
      }

      // 3. Get currently reserved seats for this booking
      const { data: currentSeats, error: currentSeatsError } = await supabase
        .from("seats")
        .select("seat_id")
        .eq("showtime_id", showtimeId)
        .eq("reserved_by", user.id);

      if (currentSeatsError) {
        console.error("Error fetching current seats:", currentSeatsError);
        return res.status(500).json({ error: currentSeatsError });
      }

      const currentSeatIds = currentSeats.map(seat => seat.seat_id);

      // 4. Check if any NEW seat is already booked by someone else
      const newSeats = seatNumber.filter(seat => !currentSeatIds.includes(seat));
      
      for (const seat of newSeats) {
        const row = seat.charAt(0);
        const seatNum = seat.slice(1);

        const { data: existingSeat, error: seatCheckError } = await supabase
          .from("seats")
          .select("*")
          .eq("row", row)
          .eq("seat_number", seatNum)
          .eq("showtime_id", showtimeId)
          .neq("reserved_by", user.id); // Not reserved by current user

        if (seatCheckError) {
          console.error("Error checking existing seat:", seatCheckError);
          return res.status(500).json({ error: seatCheckError });
        }

        if (existingSeat && existingSeat.length > 0) {
          return res.status(409).json({ error: `Seat ${seat} is already booked by another user` });
        }
      }

      // 5. Remove old seats that are no longer selected
      const seatsToRemove = currentSeatIds.filter(seat => !seatNumber.includes(seat));
      
      if (seatsToRemove.length > 0) {
        // Remove from seats table
        const { error: removeSeatsError } = await supabase
          .from("seats")
          .delete()
          .eq("showtime_id", showtimeId)
          .eq("reserved_by", user.id)
          .in("seat_id", seatsToRemove);

        if (removeSeatsError) {
          console.error("Error removing old seats:", removeSeatsError);
          return res.status(500).json({ error: removeSeatsError });
        }

        // Remove from booking_seats table
        const { error: removeBookingSeatsError } = await supabase
          .from("booking_seats")
          .delete()
          .eq("booking_id", bookingId)
          .in("seat_id", seatsToRemove);

        if (removeBookingSeatsError) {
          console.error("Error removing old booking seats:", removeBookingSeatsError);
          return res.status(500).json({ error: removeBookingSeatsError });
        }
      }

      // 6. Add new seats
      if (newSeats.length > 0) {
        // Insert new seats
        const seatInserts = newSeats.map(seat => {
          const row = seat.charAt(0);
          const seatNum = seat.slice(1);
          
          return {
            seat_id: seat,
            row: row,
            seat_number: seatNum,
            showtime_id: showtimeId,
            seat_status: "reserved",
            reserved_by: user.id,
          };
        });

        const { data: newSeatData, error: seatError } = await supabase
          .from("seats")
          .upsert(seatInserts, { 
            onConflict: 'seat_id,showtime_id',
            ignoreDuplicates: false 
          })
          .select();

        if (seatError) {
          console.error("Error adding new seats:", seatError);
          return res.status(500).json({ error: seatError });
        }

        // Insert new booking_seats records
        const bookingSeatInserts = newSeats.map(seat => ({
          seat_id: seat,
          showtime_id: showtimeId,
          booking_id: bookingId,
        }));

        const { data: newBookingSeatData, error: bookingSeatError } = await supabase
          .from("booking_seats")
          .insert(bookingSeatInserts)
          .select();

        if (bookingSeatError) {
          console.error("Error adding new booking seats:", bookingSeatError);
          return res.status(500).json({ error: bookingSeatError });
        }
      }

      // 7. Update the booking record
      const { data: updatedBooking, error: updateError } = await supabase
        .from("bookings")
        .update({
          total_price: sumPrice,
          updated_at: new Date().toISOString(),
          reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString() // Extend reservation
        })
        .eq("booking_id", bookingId)
        .select();

      if (updateError) {
        console.error("Error updating booking:", updateError);
        return res.status(500).json({ error: updateError });
      }

      return res.status(200).json({ 
        message: "Booking updated successfully",
        data: updatedBooking,
        bookingId: bookingId
      });

    } catch (error) {
      console.error("=== UPDATE BOOKING ERROR ===");
      console.error("Error in PUT request:", error);
      console.error("Stack trace:", error.stack);
      return res.status(500).json({ 
        error: "Internal Server Error",
        message: "Failed to update booking",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler);