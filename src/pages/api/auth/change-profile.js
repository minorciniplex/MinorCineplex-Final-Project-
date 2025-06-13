import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";


const handler = async (req, res) => {
  const supabase = req.supabase;
  const { name, email } = req.body;
  const userId = req.user.id;

  if (req.method === "PUT") {

    if (!name || !email) {
        return res.status(400).json({ error: "All fields are required." });
        }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: "Email is invalid." });
        }
    try {
      const { data, error } = await supabase.auth.updateUser({
        name: name,
        email: email,
        
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const { data: userData, error: updateError } = await supabase
        .from("users")
        .update({ name, email })
        .eq("user_id", userId);

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

export default withMiddleware([requireUser], handler);
