import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
    const supabase = createSupabaseServerClient(req, res);
    
    const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
        
      if (!user || userError) {
        return res.status(401).json({ error: "Unauthorized: Please login first." });
      }
  
    if (req.method === "POST") {
    const { user_id, coupon_id } = req.body;

    if (!user_id || !coupon_id) {
      return res.status(400).json({ error: "Missing user_id or coupon_id" });
    }

    const supabase = createSupabaseServerClient(req, res);

    // เพิ่มคูปองเข้า user_coupons
    const { data, error } = await supabase
      .from("user_coupons")
      .insert([
        {
          user_id,
          coupon_id,
          is_used: false, // ค่าเริ่มต้น
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    await supabase.rpc('decrement_usage_limit', { coupon_id_param: coupon_id });

    return res.status(201).json({ user_coupon: data[0] });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
