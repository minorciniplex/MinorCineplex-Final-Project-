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
      console.log("Starting cancellation process for booking:", bookingId);

      // 1. Get booking details with showtime info
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          *,
          showtimes (
            date,
            start_time
          )
        `)
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .single();

      if (bookingError || !bookingData) {
        console.error("Error fetching booking:", bookingError);
        return res.status(404).json({ error: "Booking not found or unauthorized" });
      }

      // Check if already cancelled
      if (bookingData.status === "cancelled" || bookingData.cancelled_at) {
        return res.status(400).json({ error: "Booking is already cancelled" });
      }

      // 2. Calculate refund based on time before showtime
      const showtime = bookingData.showtimes;
      const showtimeDateTime = new Date(`${showtime.date}T${showtime.start_time}`);
      const now = new Date();
      const hoursBeforeShowtime = Math.max(0, (showtimeDateTime - now) / (1000 * 60 * 60));
      
      let refundPercentage = 0;
      if (hoursBeforeShowtime >= 2) {
        refundPercentage = 100; // Full refund
      } else if (hoursBeforeShowtime >= 0.5) {
        refundPercentage = 75;  // Partial refund
      } else {
        refundPercentage = 0;   // No refund
      }

      const originalAmount = parseFloat(bookingData.total_price);
      const refundAmount = (originalAmount * refundPercentage) / 100;

      console.log("Cancellation details:", {
        bookingId,
        originalAmount,
        hoursBeforeShowtime,
        refundPercentage,
        refundAmount
      });

      // 3. Create cancellation record
      const { data: cancellationData, error: cancellationError } = await supabase
        .from("booking_cancellations")
        .insert({
          booking_id: bookingId,
          user_id: user.id,
          cancellation_reason: cancellationReason,
          original_total_price: originalAmount,
          refund_amount: refundAmount,
          refund_percentage: refundPercentage,
          showtime_date: showtimeDateTime.toISOString(),
          hours_before_showtime: Math.round(hoursBeforeShowtime * 100) / 100,
          refund_status: refundAmount > 0 ? 'pending' : 'completed',
          refund_method: refundAmount > 0 ? 'original_payment_method' : null
        })
        .select()
        .single();

      if (cancellationError) {
        console.error("Error creating cancellation record:", cancellationError);
        return res.status(500).json({ error: "Failed to create cancellation record" });
      }

      // 4. Update booking status to cancelled
      const { error: updateBookingError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_id: cancellationData.cancellation_id,
          updated_at: new Date().toISOString()
        })
        .eq("booking_id", bookingId);

      if (updateBookingError) {
        console.error("Error updating booking status:", updateBookingError);
        return res.status(500).json({ error: "Failed to update booking status" });
      }

      // 5. Release seats by updating their status
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
        // Continue with cancellation even if seat release fails
      }

      // 6. Get payment information for refund processing
      const { data: paymentData } = await supabase
        .from("payments")
        .select("payment_method, payment_id")
        .eq("booking_id", bookingId)
        .single();

      console.log("Cancellation completed successfully");

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: {
          cancellationId: cancellationData.cancellation_id,
          refundAmount: refundAmount,
          refundPercentage: refundPercentage,
          refundStatus: cancellationData.refund_status,
          hoursBeforeShowtime: Math.round(hoursBeforeShowtime * 100) / 100,
          paymentMethod: paymentData?.payment_method || null
        }
      });

    } catch (error) {
      console.error("Error in cancellation process:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler); 