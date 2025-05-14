export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const supabase = createSupabaseServerClient(req, res);

    // ✅ Get user from session
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = user.id;
    const { couponId } = req.body; // ✅ ใช้ camelCase

    if (!couponId) {
        return res.status(400).json({ error: "Missing couponId" });
    }

    try {
        // ❌ Check if already exists
        const { data: existing, error: checkError } = await supabase
            .from("user_coupons")
            .select("*")
            .eq("user_id", userId)
            .eq("coupon_id", couponId);

        if (checkError) {
            console.error("Error checking existing coupon:", checkError);
            return res.status(500).json({ error: "1 Server Error" });
        }

        if (existing.length > 0) {
            return res.status(400).json({ error: "Coupon already claimed" });
        }

        // ✅ Insert new coupon
        const { data, error } = await supabase
            .from("user_coupons")
            .insert([
                {
                    user_id: userId,
                    coupon_id: couponId,
                }
            ]);

        if (error) {
            console.error("Error inserting data:", error);
            return res.status(500).json({ error: "2 Server Error" });
        }

        // ถ้าการเคลมสำเร็จ ส่งข้อความว่าเคลมสำเร็จ
        return res.status(200).json({ success: true, message: "Coupon claimed successfully" });

    } catch (error) {
        console.error("Error in POST handler:", error);
        return res.status(500).json({ error: "3 Server Error" });
    }
}