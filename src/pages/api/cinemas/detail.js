import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);

  const { id } = req.query;

  // Validate id parameter
  if (!id) {
    return res.status(400).json({ message: "Cinema ID is required" });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("cinemas")
        .select("name, description, pic_url, facilities")
        .eq("cinema_id", id)
        .single();

      if (error) {
        console.error("Error fetching cinema data:", error);
        return res.status(500).json({ error: "Error fetching cinema data" });
      }

      if (!data) {
        return res.status(404).json({ error: "Cinema not found" });
      }

      return res.status(200).json({ data });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
