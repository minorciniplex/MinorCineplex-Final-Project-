import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const { showtimeId, bookingId } = req.query;
  const user = req.user;

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          ` 
          reserved_until
            `
        )
        .eq("user_id", user.id)
        .eq("showtime_id", showtimeId)
        .eq("booking_id", bookingId);

      if (error) {
        return res.status(500).json({ error: error });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: error });
      }

      return res.status(200).json({ data: data[0] });
    } catch (error) {
      console.error("Error in GET request:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler);
