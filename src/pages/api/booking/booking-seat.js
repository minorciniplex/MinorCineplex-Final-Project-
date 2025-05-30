import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";


const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "POST") {
    const { showtimeId, seatNumber, row, sumPrice } = req.body;

    // Validate input
    if (!showtimeId || !seatNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Check if the seat is already booked
      const { data: existingBooking, error: bookingError } = await supabase
        .from("seats")
        .select("*")
        .eq("row", row)
        .eq("seat_number", seatNumber)


      if (bookingError) {
        console.error("Error checking existing booking:", bookingError);
        return res.status(500).json({ error: bookingError });
      }

if (existingBooking && existingBooking.length > 0) {
        return res.status(409).json({ error: "Seat is already booked" });
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
        })
        .select();

      if (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({ error: error });
      }

      const { seat, error: seatError } = await supabase
        .from("seats")
        .insert({
         seat_id: "E9",
          row: row,
          seat_number: seatNumber,
          showtime_id: showtimeId,
          seat_status: "pending",
        })
        .select();

        if (seatError) {
        console.error("Error creating seat booking:", seatError);
        return res.status(500).json({ error: seatError });
        }

      return res.status(201).json({ data, seat });
    } catch (error) {
      console.error("Error in POST request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  
};

export default withMiddleware([requireUser], handler);