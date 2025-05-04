import { supabase } from "@/utils/supabase.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Email is invalid." });
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const userId = signUpData?.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "Failed to retrieve user ID" });
    }

    const { data, error: insertError } = await supabase
      .from("users")
      .insert([{ name, email, user_id: userId }]);

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    return res.status(201).json({ message: "Register successful" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
