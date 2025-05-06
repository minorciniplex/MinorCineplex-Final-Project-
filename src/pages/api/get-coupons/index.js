import { createSupabaseServerClient } from "@/utils/supabaseCookie";
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createSupabaseServerClient( req, res );

  // ดึงข้อมูลคูปองทั้งหมด พร้อมข้อมูลเจ้าของคูปอง
  const { data, error } = await supabase
    .from("coupons")
    .select(`
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
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ coupons: data });
}

