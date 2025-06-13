import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";
import { sendCancellationNotifications } from "@/services/notificationService";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "POST") {
    const { bookingId, cancellationReason } = req.body;

    if (!bookingId || !cancellationReason) {
      return res.status(400).json({ 
        error: "Missing booking ID or cancellation reason" 
      });
    }

    try {
      // 1. Get booking details with related data
      const { data: bookingDetails, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          *,
          showtimes (
            date,
            start_time,
            movies (title, poster_url),
            screens (
              screen_number,
              cinemas (name, address)
            )
          )
        `)
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .single();

      if (bookingError || !bookingDetails) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (bookingDetails.status === "cancelled") {
        return res.status(400).json({ error: "Booking already cancelled" });
      }

      // 2. Calculate refund
      const showDateTime = new Date(`${bookingDetails.showtimes.date}T${bookingDetails.showtimes.start_time}`);
      const hoursUntilShow = (showDateTime - new Date()) / (1000 * 60 * 60);
      
      let refundPercentage = 0;
      if (hoursUntilShow >= 2) refundPercentage = 100;
      else if (hoursUntilShow >= 0.5) refundPercentage = 75;
      
      const originalAmount = parseFloat(bookingDetails.total_price);
      const refundAmount = Math.round(originalAmount * (refundPercentage / 100));

      // 3. Update booking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString()
        })
        .eq("booking_id", bookingId);

      if (updateError) {
        return res.status(500).json({ error: "Failed to cancel booking" });
      }

      // 4. Store cancellation record
      await supabase.from("booking_cancellations").insert({
        booking_id: bookingId,
        user_id: user.id,
        cancellation_reason: cancellationReason,
        original_total_price: originalAmount,
        refund_amount: refundAmount,
        refund_percentage: refundPercentage,
        hours_before_showtime: hoursUntilShow,
        refund_status: refundAmount > 0 ? 'pending' : 'completed',
        cancellation_date: new Date().toISOString()
      });

      // 5. Release seats
      await supabase
        .from("seats")
        .update({
          seat_status: "available",
          reserved_by: null,
          reserved_until: null
        })
        .eq("showtime_id", bookingDetails.showtime_id)
        .eq("reserved_by", user.id);

      // 6. Get user data for notifications
      const { data: userData } = await supabase
        .from("users")
        .select("id, email, name, phone")
        .eq("id", user.id)
        .single();

      // 7. Send notifications asynchronously
      if (userData) {
        const notificationData = {
          bookingId,
          movieTitle: bookingDetails.showtimes.movies.title,
          cinemaName: bookingDetails.showtimes.screens.cinemas.name,
          showtimeDate: new Date(bookingDetails.showtimes.date).toLocaleDateString('th-TH'),
          showtimeTime: bookingDetails.showtimes.start_time?.slice(0, 5),
          originalAmount,
          refundAmount,
          refundPercentage,
          cancellationReason,
          cancellationDate: new Date().toISOString()
        };

        // Send notifications in background (don't await)
        sendCancellationNotifications(userData, notificationData, {
          sendEmail: true,
          sendSMS: true,
          sendPush: true
        }).catch(error => {
          console.error("Notification error:", error);
        });
      }

      // 8. Return success response
      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully. Notifications are being sent.",
        data: {
          bookingId,
          refundAmount,
          refundPercentage,
          cancellationReason,
          movieTitle: bookingDetails.showtimes.movies.title,
          notifications: {
            status: "sending",
            message: "Email, SMS, and push notifications are being sent"
          }
        }
      });

    } catch (error) {
      console.error("Cancellation error:", error);
      return res.status(500).json({ 
        error: "Internal Server Error"
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler); 