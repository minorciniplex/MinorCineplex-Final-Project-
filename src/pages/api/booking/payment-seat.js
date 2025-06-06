import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";


const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "POST") {
    const { showtimeId, seatNumber, sumPrice, bookingId } = req.body;

    // Validate input - เพิ่ม bookingId ในการตรวจสอบ
    if (!showtimeId || !seatNumber || !Array.isArray(seatNumber) || seatNumber.length === 0 || !bookingId) {
      return res.status(400).json({ error: "Missing required fields or invalid data" });
    }

    try {
      // ตรวจสอบว่า booking นี้เป็นของ user คนนี้และมีสถานะ reserved
      const { data: existingBooking, error: bookingCheckError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .eq("status", "reserved")
        .single();

      if (bookingCheckError || !existingBooking) {
        console.error("Error checking booking:", bookingCheckError);
        return res.status(400).json({ error: "Invalid booking or booking not found" });
      }


      // อัปเดต booking status เป็น "booked"
      const { data: updatedBooking, error: bookingUpdateError } = await supabase
        .from("bookings")
        .update({
          status: "booked",
          updated_at: new Date().toISOString(),
          reserved_until: null // ลบเวลาจำกัดการจอง
        })
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .select();

      if (bookingUpdateError) {
        console.error("Error updating booking:", bookingUpdateError);
        return res.status(500).json({ error: bookingUpdateError });
      }

      // อัปเดต seats status เป็น "booked"
      const seatIds = seatNumber; // สมมติว่า seatNumber คือ array ของ seat_id
      
      const { data: updatedSeats, error: seatUpdateError } = await supabase
        .from("seats")
        .update({
          seat_status: "booked"
        })
        .in("seat_id", seatIds)
        .eq("showtime_id", showtimeId)
        .eq("reserved_by", user.id)
        .select();

      if (seatUpdateError) {
        console.error("Error updating seats:", seatUpdateError);
        return res.status(500).json({ error: seatUpdateError });
      }


      return res.status(200).json({ 
        message: "Payment successful, booking confirmed",
        booking: updatedBooking[0],
        seats: updatedSeats,
        success: true
      });

    } catch (error) {
      console.error("Error in POST request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  
};

export default withMiddleware([requireUser], handler);