import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";
import { processBookingRefund } from "@/services/refundService";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "POST") {
    const { bookingId, cancellationId } = req.body;

    if (!bookingId || !cancellationId) {
      return res.status(400).json({ 
        error: "Missing booking ID or cancellation ID" 
      });
    }

    try {
      // 1. Get cancellation record with booking and payment details
      const { data: cancellationData, error: cancellationError } = await supabase
        .from("booking_cancellations")
        .select(`
          *,
          bookings (
            booking_id,
            total_price,
            user_id,
            payments (
              payment_id,
              payment_method,
              gateway_payment_id,
              amount,
              status
            )
          )
        `)
        .eq("cancellation_id", cancellationId)
        .eq("booking_id", bookingId)
        .eq("user_id", user.id)
        .single();

      if (cancellationError || !cancellationData) {
        console.error("Error fetching cancellation data:", cancellationError);
        return res.status(404).json({ 
          error: "Cancellation record not found" 
        });
      }

      // 2. Check if refund already processed
      if (cancellationData.refund_status === 'completed') {
        return res.status(400).json({
          error: "Refund already processed",
          refundId: cancellationData.refund_id
        });
      }

      // 3. Check if refund is eligible
      if (cancellationData.refund_amount <= 0) {
        return res.status(400).json({
          error: "No refund amount - ineligible for refund"
        });
      }

      // 4. Get payment information
      const booking = cancellationData.bookings;
      const payment = booking.payments;

      if (!payment || !payment.gateway_payment_id) {
        return res.status(400).json({
          error: "Payment information not found - cannot process refund"
        });
      }

      // 5. Prepare refund data
      const refundData = {
        bookingId: bookingId,
        paymentMethod: payment.payment_method,
        paymentId: payment.gateway_payment_id,
        refundAmount: parseFloat(cancellationData.refund_amount),
        refundReason: cancellationData.cancellation_reason,
        originalAmount: parseFloat(cancellationData.original_total_price),
        userId: user.id
      };

      // 6. Update refund status to processing
      await supabase
        .from("booking_cancellations")
        .update({
          refund_status: 'processing',
          refund_processing_started: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("cancellation_id", cancellationId);

      // 7. Process refund through payment gateway
      const refundResult = await processBookingRefund(refundData);

      if (refundResult.success) {
        // 8. Update cancellation record with refund success
        const { error: updateError } = await supabase
          .from("booking_cancellations")
          .update(refundResult.dbResult.updateData)
          .eq("cancellation_id", cancellationId);

        if (updateError) {
          console.error("Error updating cancellation record:", updateError);
        }

        // 9. Send refund confirmation email
        try {
          const { sendRefundConfirmationEmail } = await import("@/services/emailService");
          
          // Get user email
          const { data: userData } = await supabase
            .from("users")
            .select("email, name")
            .eq("user_id", user.id)
            .single();

          if (userData && userData.email) {
            await sendRefundConfirmationEmail(userData.email, {
              userName: userData.name,
              bookingId: bookingId,
              refundId: refundResult.refundId,
              refundAmount: refundResult.refundAmount,
              estimatedDays: refundResult.estimatedDays,
              refundMethod: payment.payment_method
            });
          }
        } catch (emailError) {
          console.error("Error sending refund confirmation email:", emailError);
          // Don't fail the refund if email fails
        }

        return res.status(200).json({
          success: true,
          message: "Refund processed successfully",
          data: {
            refundId: refundResult.refundId,
            refundAmount: refundResult.refundAmount,
            status: refundResult.status,
            estimatedDays: refundResult.estimatedDays,
            paymentMethod: payment.payment_method,
            processedAt: new Date().toISOString()
          }
        });

      } else {
        // 8. Update cancellation record with refund failure
        await supabase
          .from("booking_cancellations")
          .update({
            refund_status: 'failed',
            refund_error: refundResult.error,
            refund_failed_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("cancellation_id", cancellationId);

        return res.status(500).json({
          success: false,
          error: refundResult.error,
          message: "Failed to process refund"
        });
      }

    } catch (error) {
      console.error("Error in refund processing:", error);

      // Update cancellation record with error
      await supabase
        .from("booking_cancellations")
        .update({
          refund_status: 'failed',
          refund_error: error.message,
          refund_failed_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("cancellation_id", cancellationId);

      return res.status(500).json({ 
        error: "Internal Server Error"
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler); 