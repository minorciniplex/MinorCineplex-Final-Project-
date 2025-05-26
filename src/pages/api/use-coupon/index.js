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
        "discount_type,discount_value,end_date,min_purchase,status,used_count"
      )
      .eq("coupon_id", coupon_id)
      .single();
    if (couponError || !coupon) return res.status(400).json({ error: "Coupon not found" });

    // เช็ค 1: วันหมดอายุ
    const now = new Date();
    const endDate = new Date(coupon.end_date);
    if (now > endDate) {
      return res.status(400).json({ error: "คูปองนี้หมดอายุแล้ว" });
    }

    // เช็ค 2: ยอดขั้นต่ำ
    if (booking.total_price < coupon.min_purchase) {
      const diff = coupon.min_purchase - booking.total_price;
      return res.status(400).json({ error: `ยอดซื้อขั้นต่ำไม่ถึง ขาดอีก ${diff} บาท` });
    }

    // เช็ค 3: สถานะคูปอง
    if (coupon.status !== "active") {
      return res.status(400).json({ error: "คูปองนี้ไม่สามารถใช้งานได้" });
    }

    // 4. คำนวณส่วนลด
    let discount_amount = 0;
    if (coupon.discount_type === "percentage") {
      discount_amount = booking.total_price * (coupon.discount_value / 100);
    } else {
      discount_amount = coupon.discount_value;
    }

    // ส่งข้อมูลกลับ (คูปองใช้งานได้)
    return res.status(200).json({ message: "คูปองสามารถใช้งานได้", discount_amount });
} 
export default withMiddleware([requireUser], handler); 