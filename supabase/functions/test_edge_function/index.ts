// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const now = new Date().toISOString();

  // 1. ดึง booking ที่หมดเวลา
  const { data: expiredBookings, error } = await supabase
    .from("bookings")
    .select("booking_id, status")
    .lt("reserved_until", now)
    .eq("status", "reserved");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  for (const booking of expiredBookings) {
    // 2. ดึงคูปองที่แนบกับ booking นี้
    const { data: coupons } = await supabase
      .from("booking_coupons")
      .select("coupon_id")
      .eq("booking_id", booking.booking_id);

    // 3. คืนคูปองให้เป็น active
    for (const c of coupons ?? []) {
      await supabase
        .from("user_coupons")
        .update({ coupon_status: "active", used_date: null })
        .eq("coupon_id", c.coupon_id)
        .eq("coupon_status", "pending"); // optional check
    }

    // 4. ลบ booking ที่หมดเวลา
    await supabase
      .from("bookings")
      .delete()
      .eq("booking_id", booking.booking_id);
  }

  // 5. ถ้ามี booking ที่ยังไม่หมดเวลาแต่เปลี่ยนเป็น "booked" → mark coupon เป็น "used"
  const { data: bookedBookings } = await supabase
    .from("bookings")
    .select("booking_id")
    .eq("status", "booked");

  // สร้าง array สำหรับเก็บข้อมูล booking_id และ coupons
  const bookedWithCoupons = [];

  for (const booking of bookedBookings ?? []) {
    const { data: coupons } = await supabase
      .from("booking_coupons")
      .select("coupon_id")
      .eq("booking_id", booking.booking_id);

    for (const c of coupons ?? []) {
      await supabase
        .from("user_coupons")
        .update({ coupon_status: "used" })
        .eq("coupon_id", c.coupon_id);
    }
    // เก็บข้อมูล booking_id และ coupons
    bookedWithCoupons.push({
      booking_id: booking.booking_id,
      coupons: coupons ?? []
    });
  }

  return new Response(JSON.stringify({ bookedBookings: bookedWithCoupons }), {
    headers: { "Content-Type": "application/json" },
  });
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/test_edge_function' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/