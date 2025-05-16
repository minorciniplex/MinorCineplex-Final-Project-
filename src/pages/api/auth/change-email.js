import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";
//confirm email and name 

const handler = async (req, res) => {
    const supabase = req.supabase;
    
    if (req.method === "PUT") {
        const { email } = req.body;
        const userId = req.user.id;


        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ error: "Email is invalid." });
        }

        // อัพเดทอีเมลและรหัสผ่านใน authentication
        const { error: authError } = await supabase.auth.updateUser({
            email: email
        });
        
        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        // อัพเดทชื่อในตาราง users
        const { error: updateError } = await supabase
            .from("users")
            .update({  
                email: email })
            .eq("user_id", userId);

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        return res.status(200).json({ message: "Profile updated successfully" });
    }
    
    return res.status(405).json({ error: "Method not allowed" });
};

export default withMiddleware([requireUser], handler);
