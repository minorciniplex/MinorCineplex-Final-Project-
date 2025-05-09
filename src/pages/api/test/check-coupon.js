import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return res.status(401).json({ error: "Unauthorized: Please login first." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id, coupon_id } = req.body;

  if (!user_id || !coupon_id) {
    return res.status(400).json({ error: "Missing user_id or coupon_id" });
  }

  try {
    const { data: existingCoupon, error: checkError } = await supabase
      .from("user_coupons")
      .select("*")
      .eq("user_id", user_id)
      .eq("coupon_id", coupon_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return res.status(500).json({ error: "Error checking existing coupon" });
    }

    const claimed = existingCoupon;

    return res.status(200).json({ success: true, claimed });
  } catch (err) {
    console.error("Error checking user coupon:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
