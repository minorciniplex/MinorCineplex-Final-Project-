import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("showtimes")
        .select("*")
        .eq("movie_id", "013b897b-3387-4b7f-ab23-45b78199020a")
        .eq("date", "2025-05-10")
        .eq("screen_id", "9aa9c1a4-8f9e-4325-b5ee-65f99185247a");

      if (error) {
        console.error("Error fetching profile data:", error);
        return res.status(500).json({ error: "Error fetching Picture data" });
      }

      return res.status(200).json({ data });
    } catch (error) {
      console.error("Error in GET request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
