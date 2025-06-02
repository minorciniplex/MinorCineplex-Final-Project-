import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  //เพิ่ม booking_coupon_id เพื่อ policy auth สำหรับลบ booking_coupon
  try {
    const { couponId, booking_coupon_id } = req.body;

    if (!couponId) {
      return res.status(400).json({ error: 'Coupon ID is required' });
    }

    // ลบ booking_coupons
    const { data: deletedBookingCoupon, error: deleteBookingCouponError } = await supabase
      .from('booking_coupons')
      .delete()
      .eq('coupon_id', couponId)
      .eq('booking_coupon_id', booking_coupon_id)
      .select();

    if (deleteBookingCouponError) {
      console.error('Error deleting booking coupon:', deleteBookingCouponError);
      return res.status(500).json({ message: deleteBookingCouponError });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Booking coupon deleted successfully',
      data: {
        deletedBookingCoupon
      }
    });
  } catch (error) {
    console.error('Error in coupon expire API:', error);
    return res.status(500).json({ message: error.message });
  }
};

export default withMiddleware([requireUser], handler);