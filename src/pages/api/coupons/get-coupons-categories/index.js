import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, page = 1, pageSize = 5 } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Missing coupon owner name" });
  }

  const supabase = createSupabaseServerClient(req, res);

  // 1. ดึง owner ทั้งหมดที่ name ตรงกัน
  const { data: owners, error: ownerError } = await supabase
    .from("coupon_owners")
    .select("*")
    .eq("name", name);

  if (ownerError) {
    return res.status(500).json({ error: ownerError.message });
  }
  if (!owners || owners.length === 0) {
    return res.status(404).json({ error: "Coupon owner not found" });
  }

  // 2. รวม owner_id ทั้งหมด
  const ownerIds = owners.map(o => o.owner_id);

  // 3. คำนวณช่วง pagination
  const pageInt = parseInt(page, 10);
  const pageSizeInt = parseInt(pageSize, 10);
  const from = (pageInt - 1) * pageSizeInt;
  const to = from + pageSizeInt - 1;

  // 4. ดึงคูปองทั้งหมดที่ owner_id ตรงกัน พร้อม pagination
  const { data: coupons, error: couponsError, count } = await supabase
    .from("coupons")
    .select("*", { count: "exact" })
    .in("owner_id", ownerIds)
    .range(from, to);

  if (couponsError) {
    return res.status(500).json({ error: couponsError.message });
  }

  // 5. ส่งข้อมูล owner และ coupons (พร้อม pagination)
  return res.status(200).json({
    owners,
    coupons,
    pagination: {
      page: pageInt,
      pageSize: pageSizeInt,
      total: count
    }
  });
}
