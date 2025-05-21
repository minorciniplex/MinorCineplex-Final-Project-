import { createSupabaseServerClient } from "@/utils/supabaseCookie";

// Helper: Simple date format validator (YYYY-MM-DD)
const isValidDate = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

// Helper: Simple UUID v4 validator
const isValidUUID = (uuid) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    uuid
  );

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);

  const { movieId, date } = req.query;

  // ✅ Validation
  if (!movieId || !date) {
    return res.status(400).json({
      error: "Missing required query parameters: cinemaId, date",
    });
  }

  if (!isValidUUID(movieId)) {
    return res
      .status(400)
      .json({ error: "Invalid cinemaId format. Must be a valid UUID." });
  }

  if (!isValidDate(date)) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Must be YYYY-MM-DD." });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
      .from('showtimes')
      .select(`
        start_time,
        date,
        screens!inner(
          screen_number,
          cinemas!inner(
            name,
            facilities
          )
        )
      `)
      .eq('movie_id', movieId)
      .eq('date', date);

      if (error) {
        console.error("Error fetching showtimes data:", error);
        return res.status(500).json({ error: "Error fetching showtimes data" });
      }

      if (!data) {
        return res.status(404).json({ error: "showtimes not found" });
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
