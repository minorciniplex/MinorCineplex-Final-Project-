import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "POST") {
    const { showtimeId, seatNumber, bookingId } = req.body;
    

    // Validate input
    if (!showtimeId || !seatNumber || !Array.isArray(seatNumber) || seatNumber.length === 0 || !bookingId) {
      return res.status(400).json({ error: "Missing required fields or invalid seat data" });
    }

    try {
      // 1. ลบข้อมูลใน booking_seats
      const { data: bsData, error: bookingSeatsError } = await supabase
        .from("booking_seats")
        .delete()
        .eq("booking_id", bookingId)
        .select();

      if (bookingSeatsError) {
        console.error("Error deleting booking_seats:", bookingSeatsError);
        return res.status(500).json({ error: bookingSeatsError });
      }

      // 2. ลบข้อมูลที่นั่งใน seats
      const { data: seatsData, error: seatsError } = await supabase
        .from("seats")
        .delete()
        .in("seat_id", seatNumber)
        .eq("showtime_id", showtimeId)
        .eq("reserved_by", user.id)
        .select();

      if (seatsError) {
        console.error("Error deleting seats:", seatsError);
        return res.status(500).json({ error: seatsError });
      }

      // 3. ลบ booking หลัก
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .delete()
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .select();

      if (bookingError) {
        console.error("Error deleting booking:", bookingError);
        return res.status(500).json({ error: bookingError });
      }

      return res.status(200).json({ message: "Booking cancelled and deleted successfully"});
    } catch (error) {
      console.error("Error in POST request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler);