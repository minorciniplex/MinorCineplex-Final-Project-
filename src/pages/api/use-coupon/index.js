import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

export  async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { booking_id, coupon_id } = req.body;
    const supabase = req.supabase;
    const user = req.user;

    // 1. ดึงข้อมูล booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("total_price")
      .eq("booking_id", booking_id)
      .single();

    if (bookingError || !booking) return res.status(400).json({ error: "Booking not found" });

    if (!user) return res.status(401).json({ error: "Unauthorized: Please login first." });
    // 2. ดึงข้อมูลคูปอง
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select(
        "discount_type,discount_value")
      .eq("coupon_id", coupon_id)
      .single();
    if (couponError || !coupon) return res.status(400).json({ error: "Coupon not found" });

    // 3. คำนวณส่วนลด
    let discount_amount = 0;
    if (coupon.discount_type === "percentage") {
      discount_amount = booking.total_price * (coupon.discount_value / 100);
    } else {
      discount_amount = coupon.discount_value;
    }

    // 4. บันทึกการใช้คูปองกับ booking
    const { data, error } = await supabase
      .from("booking_coupons")
      .insert([{ booking_id, coupon_id, discount_amount }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // 5. อัปเดต user_coupons ให้ is_used = true, used_date = now
    await supabase
      .from("user_coupons")
      .update({ is_used: true, used_date: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("coupon_id", coupon_id);

    return res.status(200).json({ booking_coupon: data, discount_amount });
} 
export default withMiddleware([requireUser], handler); 