import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  //เพิ่ม booking_coupon_id เพื่อ policy auth สำหรับลบ booking_coupon
  try {
    const { couponId } = req.body;
    //update coupon status to active

    const { data: updatedCoupon, error: updateError } = await supabase
      .from("user_coupons")
      .update({ coupon_status: "active", used_date: null })
      .eq("user_id", user.id)
      .eq("coupon_id", couponId);

    if (updateError) {
      console.error("Error updating user coupon:", updateError);
      return res.status(500).json({ error: "Error updating user coupon" });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon status updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Error in cancel-coupon-status API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default withMiddleware([requireUser], handler);
