import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";
import { createClient } from '@supabase/supabase-js';

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

  const { bookingId, paymentIntentId, paymentMethod } = req.body;
  if (!bookingId) {
    return res.status(400).json({ error: "Missing bookingId" });
  }

  try {
    console.log("=== MARK PAID REQUEST ===");
    console.log("Booking ID:", bookingId);
    console.log("User ID:", user.id);

    // 1. อัพเดตสถานะ booking เป็น "paid"
    const { data: updatedBooking, error: bookingError } = await supabase
      .from("bookings")
      .update({
        status: "paid",
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

    // 2. อัพเดตสถานะที่นั่งทั้งหมดที่เกี่ยวข้องกับ booking นี้เป็น "booked"
    const { data: updatedSeats, error: seatsError } = await supabase
      .from("seats")
      .update({
        seat_status: "booked",
        updated_at: new Date().toISOString()
      })
      .eq("showtime_id", updatedBooking[0].showtime_id)
      .eq("reserved_by", user.id)
      .eq("seat_status", "reserved")
      .select();

    if (seatsError) {
      console.error("Error updating seats:", seatsError);
      return res.status(500).json({ error: seatsError.message });
    }

    console.log("Seats updated successfully:", updatedSeats);

    // 3. บันทึกข้อมูลการจ่ายเงินลงตาราง movie_payments (ใช้ service key เพื่อ bypass RLS)
    let paymentData = null;
    if (paymentIntentId && paymentMethod) {
      // ดึงข้อมูล payment details จาก Omise ถ้าเป็น promptpay
      let paymentDetails = null;
      if (paymentMethod === 'omise_promptpay') {
        try {
          const Omise = require('omise');
          const omise = Omise({
            secretKey: process.env.OMISE_SECRET_KEY,
            omiseVersion: '2019-05-29',
          });
          const charge = await omise.charges.retrieve(paymentIntentId);
          paymentDetails = charge;
        } catch (omiseError) {
          console.error('Error fetching Omise charge details:', omiseError);
        }
      }

      const { data: insertedPayment, error: paymentError } = await supabaseService
        .from("movie_payments")
        .insert({
          payment_intent_id: paymentIntentId,
          amount: updatedBooking[0].total_price,
          currency: "thb",
          status: "successful",
          payment_method: paymentMethod,
          payment_details: paymentDetails,
          user_id: user.id,
          booking_id: bookingId,
          movie_id: updatedBooking[0].movie_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) {
        console.error("Error inserting payment data:", paymentError);
        // ไม่ return error เพราะ booking และ seat update สำเร็จแล้ว
      } else {
        console.log("Payment data inserted successfully:", insertedPayment);
        paymentData = insertedPayment;
      }
    }

    return res.status(200).json({ 
      success: true, 
      booking: updatedBooking[0],
      updatedSeats: updatedSeats,
      payment: paymentData
    });
  } catch (err) {
    console.error("Error in mark-paid:", err);
    return res.status(500).json({ error: err.message });
  }
};

export default withMiddleware([requireUser], handler); 