import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;



  if (req.method === "POST") {
    const { bookingId, cancellationReason } = req.body;

    // Validate input
    if (!bookingId || !cancellationReason) {
      return res.status(400).json({ 
        error: "Missing booking ID or cancellation reason" 
      });
    }

    try {
      // 1. Get comprehensive booking details with related data
      const { data: bookingDetails, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          *,
          showtimes (
            date,
            start_time,
            movies (
              title,
              poster_url
            ),
            screens (
              screen_number,
              cinemas (
                name,
                address
              )
            )
          )
        `)
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .single();

      if (bookingError || !bookingDetails) {
        console.error("Error fetching booking details:", bookingError);
        return res.status(404).json({ 
          error: "Booking not found or unauthorized" 
        });
      }

      // Check if already cancelled
      if (bookingDetails.status === "cancelled") {
        return res.status(400).json({ 
          error: "Booking is already cancelled" 
        });
      }

      // 2. Calculate refund amount based on timing
      const showDateTime = new Date(`${bookingDetails.showtimes.date}T${bookingDetails.showtimes.start_time}`);
      const currentTime = new Date();
      const hoursUntilShow = (showDateTime - currentTime) / (1000 * 60 * 60);
      
      let refundPercentage = 0;
      if (hoursUntilShow >= 2) {
        refundPercentage = 100;
      } else if (hoursUntilShow >= 0.5) {
        refundPercentage = 75;
      } else {
        refundPercentage = 0;
      }

      const originalAmount = parseFloat(bookingDetails.total_price);
      const refundAmount = Math.round(originalAmount * (refundPercentage / 100));

      // 3. Update booking status to cancelled
      const { data: updateResult, error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .select();

      if (updateError || !updateResult || updateResult.length === 0) {
        console.error("Error updating booking status:", updateError);
        return res.status(500).json({ 
          error: "Failed to update booking status" 
        });
      }

      // 4. Store cancellation record
      const { data: cancellationRecord, error: cancellationError } = await supabase
        .from("booking_cancellations")
        .insert({
          booking_id: bookingId,
          user_id: user.id,
          cancellation_reason: cancellationReason,
          original_total_price: originalAmount,
          refund_amount: refundAmount,
          refund_percentage: refundPercentage,
          hours_before_showtime: Math.round(hoursUntilShow),
          refund_status: refundAmount > 0 ? 'pending' : 'completed',
          cancellation_date: new Date().toISOString()
        })
        .select()
        .single();

      if (cancellationError) {
        console.error("Error storing cancellation record:", cancellationError);
        // Continue even if this fails
      }

      // 5. Release seats
      const { error: seatsError } = await supabase
        .from("seats")
        .update({
          seat_status: "available",
          reserved_by: null
        })
        .eq("showtime_id", bookingDetails.showtime_id)
        .eq("reserved_by", user.id);

      if (seatsError) {
        console.error("Error releasing seats:", seatsError);
        // Continue even if seat release fails
      }

      // 6. Get user details for notifications
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id, email, name")
        .eq("user_id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
      }

      // 7. Prepare notification data
      const notificationData = {
        bookingId: bookingId,
        movieTitle: bookingDetails.showtimes.movies.title,
        cinemaName: bookingDetails.showtimes.screens.cinemas.name,
        showtimeDate: new Intl.DateTimeFormat('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(new Date(bookingDetails.showtimes.date)),
        showtimeTime: bookingDetails.showtimes.start_time?.slice(0, 5),
        originalAmount: originalAmount,
        refundAmount: refundAmount,
        refundPercentage: refundPercentage,
        cancellationReason: cancellationReason,
        cancellationDate: new Date().toISOString()
      };

      // 8. Send notifications (run in background, don't wait)
      if (userData) {
        try {
          // Try to import and use notification service
          const { sendCancellationNotifications } = await import("@/services/notificationService");
          
          // Send notifications asynchronously (don't await to avoid blocking the response)
          sendCancellationNotifications(userData, notificationData, {
            sendEmail: true,
            sendSMS: false, // Disable SMS for now
            sendPush: false, // Disable Push for now
            sendInApp: false
          }).then(notificationResults => {
            // Log notification success/failure
            if (notificationResults.summary.totalFailed > 0) {
              console.error("Failed to send notifications:", notificationResults.summary.errors);
            }
          }).catch(error => {
            console.error("Error sending notifications:", error);
          });
        } catch (importError) {
          console.error("Error importing notification service:", importError);
        }
      }

      // 9. Return success response immediately
      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully. Notifications are being sent.",
        data: {
          bookingId: bookingId,
          refundAmount: refundAmount,
          refundPercentage: refundPercentage,
          cancellationReason: cancellationReason,
          hoursBeforeShowtime: hoursUntilShow,
          refundStatus: refundAmount > 0 ? 'pending' : 'completed',
          movieTitle: bookingDetails.showtimes.movies.title,
          cinemaName: bookingDetails.showtimes.screens.cinemas.name,
          showtime: {
            date: bookingDetails.showtimes.date,
            time: bookingDetails.showtimes.start_time
          },
          notifications: {
            status: "sending",
            message: "Email notification is being sent"
          }
        }
      });

    } catch (error) {
      console.error("Error in cancellation process:", error);
      return res.status(500).json({ 
        error: "Internal Server Error"
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler); 