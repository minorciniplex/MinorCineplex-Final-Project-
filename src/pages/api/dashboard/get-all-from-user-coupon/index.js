import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const supabase = req.supabase;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Please login first." });
    }

    const { data, error } = await supabase
      .from("user_coupons")
      .select(`
        *,
        coupons (
        *
        )
      `)
      .eq("user_id", user.id)
      .eq("is_used", FALSE);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch user coupons" });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default withMiddleware([requireUser], handler); 

