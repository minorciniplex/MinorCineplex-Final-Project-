import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { coupon_id } = req.query;
  

  if (!coupon_id) {
    return res.status(400).json({ error: "Missing coupon id" });
  }

  // ดึงข้อมูลคูปองตาม id พร้อมข้อมูลเจ้าของคูปอง
  const { data, error } = await supabase
    .from("coupons")
    .select(
      `
      coupon_id,
      code,
      discount_type,
      discount_value,
      min_purchase,
      start_date,
      end_date,
      image,
      owner_id,
      coupon_owners (
        owner_id,
        name
      )
    `
    )
    .eq("coupon_id", coupon_id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
   
  }

  if (!data) {
    return res.status(404).json({ error: "Coupon not found" });
  }

  return res.status(200).json({ coupon: data });
}
