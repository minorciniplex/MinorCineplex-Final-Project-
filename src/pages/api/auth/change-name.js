import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";
//confirm email and name 

const handler = async (req, res) => {
    const supabase = req.supabase;
    
    if (req.method === "PUT") {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ error: "All fields are required." });
        }
        const { error: updateError } = await supabase
            .from("users")
            .update({ name: name })
            .eq("user_id", userId);

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        return res.status(200).json({ message: "Profile updated successfully" });
    }
    
    return res.status(405).json({ error: "Method not allowed" });
};

export default withMiddleware([requireUser], handler);
