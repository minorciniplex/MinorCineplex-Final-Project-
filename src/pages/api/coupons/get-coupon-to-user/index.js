import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { coupon_id } = req.body;
    const supabase = req.supabase;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Please login first." });
    }

    if (!coupon_id) {
      return res.status(400).json({ error: "Coupon ID is required" });
    }

    // ตรวจสอบว่าผู้ใช้มีคูปองนี้อยู่แล้วหรือไม่
    const { data: existingCoupon, error: checkError } = await supabase
      .from("user_coupons")
      .select("*")
      .eq("user_id", user.id)
      .eq("coupon_id", coupon_id);

    if (checkError) {
      return res.status(500).json({ error: "Error checking existing coupon" });
    }

    if (existingCoupon && existingCoupon.length > 0) {
      return res.status(400).json({ error: "คุณมีคูปองนี้อยู่แล้ว" });
    }

    // เพิ่มคูปองเข้า user_coupons
    const { data, error: insertError } = await supabase
      .from("user_coupons")
      .insert([
        {
          user_id: user.id,
          coupon_id,
          coupon_status: "active",
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    // ลดจำนวนการใช้งานคูปอง
    const { error: decrementError } = await supabase.rpc('decrement_usage_limit', { 
      coupon_id_param: coupon_id 
    });

    if (decrementError) {
      // ถ้าเกิด error ในการลดจำนวน ให้ลบคูปองที่เพิ่งเพิ่มไป
      await supabase
        .from("user_coupons")
        .delete()
        .eq("user_id", user.id)
        .eq("coupon_id", coupon_id);
      
      return res.status(500).json({ error: "ไม่สามารถรับคูปองได้ กรุณาลองใหม่อีกครั้ง" });
    }

    return res.status(201).json({ success: true, user_coupon: data[0] });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง" });
  }
}

export default withMiddleware([requireUser], handler); 