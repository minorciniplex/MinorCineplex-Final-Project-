import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
    const supabase = req.supabase;
    const user = req.user;

    // 1. ดึงข้อมูล booking จาก booking_id
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .single();
    
    if (bookingError) {
        return res.status(500).json({ error: bookingError.message });
    }
    return res.status(200).json({ message: "Booking found", booking });
}
export default withMiddleware([requireUser], handler); 