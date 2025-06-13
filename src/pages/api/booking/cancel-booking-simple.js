import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "POST") {
    const { bookingId, cancellationReason } = req.body;

    // Validate input
    if (!bookingId || !cancellationReason) {
      return res.status(400).json({ error: "Missing booking ID or cancellation reason" });
    }

    try {
      // 1. Get booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .single();

      if (bookingError || !bookingData) {
        console.error("Error fetching booking:", bookingError);
        return res.status(404).json({ error: "Booking not found or unauthorized" });
      }

      // Check if already cancelled
      if (bookingData.status === "cancelled") {
        return res.status(400).json({ error: "Booking is already cancelled" });
      }

      // 2. Update booking status to cancelled
      const { data: updateResult, error: updateBookingError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .select();

      if (updateBookingError) {
        console.error("Error updating booking status:", updateBookingError);
        return res.status(500).json({ error: "Failed to update booking status" });
      }

      if (!updateResult || updateResult.length === 0) {
        console.error("No booking was updated");
        return res.status(500).json({ error: "No booking was updated - may not exist or belong to user" });
      }

      // 3. Release seats
      const { error: seatsError } = await supabase
        .from("seats")
        .update({
          seat_status: "available",
          reserved_by: null,
          reserved_until: null
        })
        .eq("showtime_id", bookingData.showtime_id)
        .eq("reserved_by", user.id);

      if (seatsError) {
        console.error("Error releasing seats:", seatsError);
        // Continue even if seat release fails
      }

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: {
          bookingId: bookingId,
          refundAmount: bookingData.total_price,
          refundPercentage: 100,
          cancellationReason: cancellationReason
        }
      });

    } catch (error) {
      console.error("Error in simple cancellation process:", error);
      return res.status(500).json({ 
        error: "Internal Server Error"
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler); 