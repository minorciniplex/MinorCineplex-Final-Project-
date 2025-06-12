import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";
import { createClient } from "@supabase/supabase-js";

// สร้าง Supabase client ด้วย service key เพื่อ bypass RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { bookingId, paymentIntentId, paymentMethod, paymentData, couponId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ error: "Missing bookingId" });
  }

  try {

    const { data: updatedBooking, error: bookingError } = await supabase
      .from("bookings")
      .update({
        status: "booked",
        updated_at: new Date().toISOString(),
        reserved_until: null,
      })
      .eq("booking_id", bookingId)
      .eq("user_id", user.id)
      .select();

    if (bookingError) {
      console.error("Error updating booking:", bookingError);
      return res.status(500).json({ error: bookingError.message });
    }

    if (!updatedBooking || updatedBooking.length === 0) {
      console.error("No booking found or updated");
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("Booking updated successfully:", updatedBooking[0]);

    const { data: updatedSeats, error: seatsError } = await supabase
      .from("seats")
      .update({
        seat_status: "booked",
        updated_at: new Date().toISOString(),
      })
      .eq("showtime_id", updatedBooking[0].showtime_id)
      .eq("reserved_by", user.id)
      .eq("seat_status", "reserved")
      .select();

    if (seatsError) {
      console.error("Error updating seats:", seatsError);
      return res.status(500).json({ error: seatsError.message });
    }

    const { data: updatedPayment, error: paymentError } = await supabase
      .from("payments")
      .update({
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", bookingId)
      .eq("user_id", user.id)
      .eq("payment_status", "pending")
      .select();

    if (paymentError) {
      console.error("Error updating seats:", paymentError);
      return res.status(500).json({ error: paymentError.message });
    }

    if(couponId){
      const { data: updatedCoupon, error: updateCouponError } = await supabase
      .from("user_coupons")
      .update({
        coupon_status: "used",
        used_date: new Date().toISOString(),
      })
      .eq("coupon_id", couponId)
      .eq("user_id", user.id)
      .select();

    if (updateCouponError) {
      console.error("Error updating coupon status:", updateCouponError);
      return res.status(500).json({ error: updateCouponError.message });
    }
    }

    let insertedPaymentData = null;
    if (paymentData || (paymentIntentId && paymentMethod)) {
      let paymentDetails = null;
      if (
        paymentMethod === "omise_promptpay" ||
        paymentMethod === "promptpay"
      ) {
        try {
          const Omise = require("omise");
          const omise = Omise({
            secretKey: process.env.OMISE_SECRET_KEY,
            omiseVersion: "2019-05-29",
          });
          const charge = await omise.charges.retrieve(paymentIntentId);
          paymentDetails = charge;
          console.log("Omise charge details retrieved:", charge);
        } catch (omiseError) {
          console.error("Error fetching Omise charge details:", omiseError);
        }
      }

      const paymentToInsert = paymentData || {
        payment_intent_id: paymentIntentId,
        amount: updatedBooking[0].total_price,
        currency: "thb",
        status: "successful",
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        user_id: user.id,
        booking_id: bookingId,
        movie_id: updatedBooking[0].movie_id,
        created_at: new Date().toISOString(),
      };

      console.log("About to insert payment data:", paymentToInsert);

      const { data: insertedPayment, error: paymentError } =
        await supabaseService
          .from("movie_payments")
          .insert(paymentToInsert)
          .select()
          .single();

      if (paymentError) {
        console.error("Error inserting payment data:", paymentError);
        // ไม่ return error เพราะ booking และ seat update สำเร็จแล้ว
      } else {
        console.log("Payment data inserted successfully:", insertedPayment);
        insertedPaymentData = insertedPayment;
      }
    }

    return res.status(200).json({
      success: true,
      booking: updatedBooking[0],
      updatedSeats: updatedSeats,
      payment: insertedPaymentData,
    });
  } catch (err) {
    console.error("Error in mark-paid:", err);
    return res.status(500).json({ error: err.message });
  }
};

export default withMiddleware([requireUser], handler);
