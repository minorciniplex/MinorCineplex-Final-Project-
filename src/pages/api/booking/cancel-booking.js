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
      console.log("Deleting booking_seats with booking_id:", bookingId);
      // 1. ลบข้อมูลใน booking_seats
      const { data: bsData, error: bookingSeatsError } = await supabase
        .from("booking_seats")
        .delete()
        .eq("booking_id", bookingId)
        .select();
      console.log("booking_seats deleted:", bsData);

      if (bookingSeatsError) {
        console.error("Error deleting booking_seats:", bookingSeatsError);
        return res.status(500).json({ error: bookingSeatsError });
      }

      console.log("Deleting seats with seat_id:", seatNumber, "showtime_id:", showtimeId, "reserved_by:", user.id);
      // 2. ลบข้อมูลที่นั่งใน seats
      const { data: seatsData, error: seatsError } = await supabase
        .from("seats")
        .delete()
        .in("seat_id", seatNumber)
        .eq("showtime_id", showtimeId)
        .eq("reserved_by", user.id)
        .select();
      console.log("seats deleted:", seatsData);

      if (seatsError) {
        console.error("Error deleting seats:", seatsError);
        return res.status(500).json({ error: seatsError });
      }

      console.log("Deleting bookings with booking_id:", bookingId, "user_id:", user.id);
      // 3. ลบ booking หลัก
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .delete()
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .select();
      console.log("bookings deleted:", bookingData);

      // const { data: bookingCouponData, error: bookingCouponError } = await supabase
      //   .from("user_coupons")
      //   .update({ coupon_status: "active" })
      //   .eq("coupon_id", couponId)
      //   .eq("user_id", user.id)
      //   .select();
      // console.log("booking_coupons updated:", bookingCouponData);

      if (bookingError) {
        console.error("Error deleting booking:", bookingError);
        return res.status(500).json({ error: bookingError });
      }

      return res.status(200).json({ message: "Booking cancelled and deleted successfully" });
    } catch (error) {
      console.error("Error in POST request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler);