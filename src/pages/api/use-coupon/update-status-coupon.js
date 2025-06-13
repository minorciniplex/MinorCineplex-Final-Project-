import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

export async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { coupon_id } = req.body;
  const supabase = req.supabase;
  const user = req.user;

  await supabase
    .from("user_coupons")
    .update({ coupon_status: "used", used_date: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("coupon_id", coupon_id);

  return res.status(200).json("success");
}
export default withMiddleware([requireUser], handler); 