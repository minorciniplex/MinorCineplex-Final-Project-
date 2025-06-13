import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;

  if (req.method === "POST") {
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ error: "Error updating password" });
      }

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error in POST request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export default withMiddleware([requireUser], handler);
