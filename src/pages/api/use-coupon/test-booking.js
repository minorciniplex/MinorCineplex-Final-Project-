import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
    const supabase = req.supabase;
    const user = req.user;

    // 1. ดึงข้อมูล booking จาก booking_id
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id);

    if (bookingError) {
        return res.status(500).json({ error: bookingError.message });
    }

    if (!bookings || bookings.length === 0) {
        return res.status(404).json({ message: "No bookings found" });
    }

    // ถ้ามีหลาย booking ให้ส่งกลับ booking ล่าสุด
    const latestBooking = bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return res.status(200).json({ message: "Booking found", booking: latestBooking });
}

export default withMiddleware([requireUser], handler);