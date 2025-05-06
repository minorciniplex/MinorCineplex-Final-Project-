import { createSupabaseServerClient } from "@/utils/supabaseCookie";



export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  
    const { email, password, remember } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  
    const supabase = createSupabaseServerClient(req, res, remember);

  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      return res.status(401).json({ error: error.message });
    }
  
    return res.status(200).json({ message: 'Login successful', data });
  }