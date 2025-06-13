import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
    const supabase = req.supabase;
    const user = req.user;
    const { showtimes, bookingId } = req.query;

    // 1. ดึงข้อมูล booking จาก booking_id
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .eq("showtime_id", showtimes)
        .eq("booking_id", bookingId);
    if (bookingError) {
        return res.status(500).json({ error: bookingError.message });
    }

    if (!bookings || bookings.length === 0) {
        return res.status(404).json({ message: "No bookings found" });
    }

    // ถ้ามีหลาย booking ให้ส่งกลับ booking ล่าสุด
   
    return res.status(200).json({ data: bookings });
}

export default withMiddleware([requireUser], handler);