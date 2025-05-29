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

    try {
      // Check if any seat is already booked
      for (const seat of seatNumber) {
        // Extract row and seat number from seat format (e.g., "E7" -> row: "E", seat: "7")
        const row = seat.charAt(0);
        const seatNum = seat.slice(1);

        const { data: existingBooking, error: bookingError } = await supabase
          .from("seats")
          .select("*")
          .eq("row", row)
          .eq("seat_number", seatNum)
          .eq("showtime_id", showtimeId);

        if (bookingError) {
          console.error("Error checking existing booking:", bookingError);
          return res.status(500).json({ error: bookingError });
        }

        if (existingBooking && existingBooking.length > 0) {
          return res.status(409).json({ error: `Seat ${seat} is already booked` });
        }
      }

      // Create a new booking
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          showtime_id: showtimeId,
          booking_date: new Date().toISOString(),
          total_price: sumPrice,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        })
        .select();

      if (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({ error: error });
      }

      // Insert all seats
      const seatInserts = seatNumber.map(seat => {
        const row = seat.charAt(0);
        const seatNum = seat.slice(1);
        
        return {
          seat_id: seat,
          row: row,
          seat_number: seatNum,
          showtime_id: showtimeId,
          seat_status: "pending",
          reserved_by: user.id,
        };
      });

      const { data: seatData, error: seatError } = await supabase
        .from("seats")
        .insert(seatInserts)
        .select();

      if (seatError) {
        console.error("Error creating seat booking:", seatError);
        return res.status(500).json({ error: seatError });
      }

   const bookingSeatInserts = seatNumber.map(seat => {
        const row = seat.charAt(0);
        const seatNum = seat.slice(1);
        
        return {
          seat_id: seat,
          showtime_id: showtimeId,
          booking_id: data[0].booking_id, 
          

        };
      });
        const { data: bookingData, error: bookingSeatError } = await supabase
            .from("booking_seats")
            .insert(bookingSeatInserts)
            .select();

        if (bookingSeatError) {
          console.error("Error creating booking seats:", bookingSeatError);
          return res.status(500).json({ error: bookingSeatError });
        }
    
      return res.status(201).json({ data, seatData});
    } catch (error) {
      console.error("Error in POST request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  
};

export default withMiddleware([requireUser], handler);