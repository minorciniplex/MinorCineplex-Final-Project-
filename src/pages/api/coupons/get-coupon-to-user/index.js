import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const supabase = createSupabaseServerClient(req, res);
    
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();
        
    if (!user || userError) {
        return res.status(401).json({ error: "Unauthorized: Please login first." });
    }

    const { coupon_id } = req.body;

    if (!coupon_id) {
        return res.status(400).json({ error: "Coupon ID is required" });
    }

    // เพิ่มคูปองเข้า user_coupons
    const { data, error } = await supabase
        .from("user_coupons")
        .insert([
            {
                user_id: user.id,
                coupon_id,
                is_used: false,
                created_at: new Date().toISOString()
            }
        ])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    await supabase.rpc('decrement_usage_limit', { coupon_id_param: coupon_id });

    return res.status(201).json({ success: true, user_coupon: data[0] });
}

