import { createSupabaseServerClient } from "@/utils/supabaseCookie";

const handler = async (req, res) => {
  const supabase = createSupabaseServerClient(req, res);

  if (req.method === "POST") {
    const { code, email, newPassword, confirmPassword } = req.body;
    
    if (!code || !email) {
      return res.status(400).json({ error: "Code and email are required" });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
      // Exchange the code for a session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error("Error exchanging code:", sessionError);
        return res.status(400).json({ error: "Invalid or expired reset code" });
      }

      // เพิ่มการตรวจสอบ password เดิม
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: newPassword
      });

      // ถ้า signIn สำเร็จแสดงว่าเป็น password เดิม
      if (!signInError && signInData.user) {
        return res.status(400).json({ error: "New password must be different from your current password" });
      }

      // Update the password
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
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default handler;