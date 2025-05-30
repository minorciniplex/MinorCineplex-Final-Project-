import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { seatId, userId } = req.body;
  const now = new Date().toISOString();

  try {
    const { error } = await supabase
      .from("seats")
      .update({
        status: "available",
        reserved_by: null,
        reserved_until: null,
      })
      .eq("id", seatId)
      .eq("reserved_by", userId)
      .lt("reserved_until", now);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error releasing expired seat:", error);
    res.status(500).json({
      success: false,
      error: "Failed to release expired seat",
    });
  }
}
