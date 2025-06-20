import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

export async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    
    const { booking_id, coupon_id } = req.body;
    const supabase = req.supabase;
    const user = req.user;

    if (!booking_id || !coupon_id) {
        return res.status(201).json({ success: false, error: "Missing required fields: booking_id and coupon_id" });
    }


    // 1. ดึงข้อมูล booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("total_price")
      .eq("booking_id", booking_id)
      .single();

    if (bookingError || !booking) {
        return res.status(201).json({ success: false, error: "Booking not found" });
    }

    // 2. ดึงข้อมูลคูปอง
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select(
        "discount_type,discount_value,end_date,min_purchase,status,used_count"
      )
      .eq("coupon_id", coupon_id)
      .single();

    if (couponError || !coupon) {
        return res.status(201).json({ success: false, error: "Coupon not found" });
    }

    // เช็ค 1: วันหมดอายุ
    const now = new Date();
    const endDate = new Date(coupon.end_date);
    if (now > endDate) {
        return res.status(401).json({ success: false, error: "This coupon has expired" });
    }

    // เช็ค 2: ยอดขั้นต่ำ
    if (booking.total_price < coupon.min_purchase) {
        const diff = coupon.min_purchase - booking.total_price;
        return res.status(401).json({ success: false, error: `Minimum purchase amount not met. Need ${diff} more baht` });
    }

    // เช็ค 3: สถานะคูปอง
    if (coupon.status !== "active") {
        return res.status(403).json({ success: false, error: "This coupon cannot be used" });
    }

    // เช็ค 4: ตรวจสอบว่าผู้ใช้มีคูปองนี้หรือไม่
    const { data: userCoupons, error: userCouponError } = await supabase
      .from("user_coupons")
      .select("*")
      .eq("user_id", user.id)
      .eq("coupon_id", coupon_id)
      .eq("coupon_status", "active" );

    if (userCouponError) {
        return res.status(401).json({ success: false, error: "Error occurred while checking coupon" });
    }

    if (!userCoupons || userCoupons.length === 0) {
        return res.status(200).json({ success: false, error: "You don't have this coupon or it has already been used" });
    }

    // คำนวณส่วนลด
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
        discountAmount = Math.floor((booking.total_price * coupon.discount_value) / 100);
    } else {
        discountAmount = coupon.discount_value;
    }

    // ตรวจสอบว่าส่วนลดไม่เกินราคารวม
    if (discountAmount > booking.total_price) {
        discountAmount = booking.total_price;
    }

    return res.status(200).json({
        success: true,
        discount_amount: discountAmount,
        original_price: booking.total_price,
        final_price: booking.total_price - discountAmount
    });
}

export default withMiddleware([requireUser], handler); 