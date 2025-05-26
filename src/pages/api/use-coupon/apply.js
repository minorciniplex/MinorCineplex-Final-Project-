import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

export async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { booking_id, coupon_id, discount_amount } = req.body;
  const supabase = req.supabase;
  const user = req.user;

  // 1. บันทึกการใช้คูปองกับ booking
  const { data, error } = await supabase
    .from("booking_coupons")
    .insert([{ booking_id, coupon_id, discount_amount }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // 2. อัปเดต user_coupons ให้ is_used = true, used_date = now
  await supabase
    .from("user_coupons")
    .update({ is_used: true, used_date: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("coupon_id", coupon_id);

  // 3. เพิ่ม used_count ใน coupons
  // ดึง used_count ปัจจุบันก่อน
  const { data: coupon, error: couponError } = await supabase
    .from("coupons")
    .select("used_count")
    .eq("coupon_id", coupon_id)
    .single();
  if (!couponError && coupon) {
    await supabase
      .from("coupons")
      .update({ used_count: coupon.used_count + 1 })
      .eq("coupon_id", coupon_id);
  }

  return res.status(200).json({ booking_coupon: data });
}
export default withMiddleware([requireUser], handler); 