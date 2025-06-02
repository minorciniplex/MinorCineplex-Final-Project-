import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { couponId, booking_coupon_id } = req.body;

    if (!couponId) {
      return res.status(400).json({ error: 'Coupon ID is required' });
    }

    // 1. ตรวจสอบว่ามี user_coupon หรือไม่
    const { data: userCoupon, error: userCouponError } = await supabase
      .from('user_coupons')
      .select('*')
      .eq('coupon_id', couponId)
      .single();

    if (userCouponError && userCouponError.code !== 'PGRST116') {
      console.error('Error checking user coupon:', userCouponError);
      return res.status(500).json({ error: 'Error checking user coupon' });
    }

    // ประกาศตัวแปร deletedBookingCoupon ไว้ข้างบน
    let deletedBookingCoupon = null;

    // 2. ลบข้อมูลจากตาราง booking_coupons
    if (userCoupon) {
      const { data, error: deleteBookingCouponError } = await supabase
        .from('booking_coupons')
        .delete()
        .eq('coupon_id', couponId)
        .eq('booking_coupon_id', booking_coupon_id)
        .select();

      if (deleteBookingCouponError) {
        console.error('Error deleting booking coupon:', deleteBookingCouponError);
        return res.status(500).json({ message: deleteBookingCouponError });
      }
      deletedBookingCoupon = data;
    }

    // 3. ถ้ามี user_coupon ให้อัพเดทสถานะเป็น active
    if (userCoupon) {
      const { data: updatedCoupon, error: updateError } = await supabase
        .from('user_coupons')
        .update({ 
          coupon_status: 'active',
          used_date: null,
        })
        .eq('coupon_id', couponId)
        .select();

      if (updateError) {
        console.error('Error updating user coupon:', updateError);
        return res.status(500).json({ error: 'Error updating user coupon' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Coupon status updated and booking coupon deleted successfully',
        data: {
          updatedCoupon,
          deletedBookingCoupon
        }
      });
    }

    // 4. ถ้าไม่มี user_coupon ให้ส่ง success response
    return res.status(200).json({ 
      success: true, 
      message: 'No user coupon found, booking coupon deleted successfully',
      
    });

  } catch (error) {
    console.error('Error in coupon expire API:', error);
    return res.status(500).json({ message: error });
  }
} 

export default withMiddleware([requireUser], handler);