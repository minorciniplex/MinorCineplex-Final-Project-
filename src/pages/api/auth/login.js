import { supabase } from "@/utils/supabase.js";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { email, password } = req.body;
    
        if (!email || !password) {
        return res.status(400).json({ error: "All fields are required." });
        }
    
        const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        });
    
        if (error) {
        return res.status(401).json({ error: error.message });
        }
    
        return res.status(200).json({ message: "Login successful", data });
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    }