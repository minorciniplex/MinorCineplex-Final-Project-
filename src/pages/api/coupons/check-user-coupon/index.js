import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createSupabaseServerClient(req, res);
  
  // เช็คการล็อคอิน
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return res.status(401).json({ error: "Unauthorized: Please login first." });
  }

  try {
    // ดึงข้อมูลคูปองของผู้ใช้
    const { data, error } = await supabase
      .from("user_coupons")
      .select(`
        *,
        coupons (
          coupon_id,
          code,
          discount_type,
          discount_value,
          min_purchase,
          start_date,
          end_date,
          image
        )
      `)
      .eq("user_id", user.id)
      .eq("coupon_id", false);

    if (error) {
      throw error;
    }

    return res.status(200).json({ 
      hasCoupon: data.length > 0,
      coupons: data 
    });

  } catch (error) {
    console.error("Error checking user coupons:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
