import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "PUT") {
    try {
      const { name, email, user_profile } = req.body;

      // อัพเดทข้อมูลในตาราง users พร้อม updated_at
      const { data, error } = await supabase
        .from("users")
        .update({
          name,
          email,
          user_profile,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: "Error updating profile" });
      }

      return res.status(200).json({ data });
    } catch (error) {
      console.error("Error in PUT request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler); 