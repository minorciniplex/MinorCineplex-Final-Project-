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

  const { cinemaId, date } = req.query;

  // ✅ Validation
  if (!cinemaId || !date ) {
    return res.status(400).json({
      error: "Missing required query parameters: cinemaId, date",
    });
  }

  if (!isValidUUID(cinemaId)) {
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
        .from("showtimes")
        .select(
          `
      start_time,
      screens!inner (
        screen_number,
        cinemas!inner (
          name
        )
      ),
      movies!inner (
        movie_id,
        title,
        poster_url,
        movie_genre_mapping!inner (
          movie_genres!inner (
            name
          )
        ),
        movie_languages!inner (
          languages!inner (
            code
          )
        )
      )
    `
        )
        .eq("screens.cinemas.cinema_id", cinemaId)
        .eq("date", date)
        .order("start_time");

      if (error) {
        console.error("Error fetching showtimes data:", error);
        return res.status(500).json({ error: "Error fetching showtimes data" });
      }

      if (!data) {
        return res.status(404).json({ error: "showtimes not found" });
      }

      // Transform the nested data structure to match the expected format
      const formattedData = data.map((item) => ({
        cinema_name: item.screens.cinemas.name,
        show_date: item.date,
        poster_url: item.movies.poster_url,
        movie_title: item.movies.title,
        genre: item.movies.movie_genre_mapping
          .map((g) => g.movie_genres.name)
          .join(", "),
        language_code: item.movies.movie_languages
          .map((l) => l.languages.code)
          .join("/ "),
        movie_id: item.movies.movie_id,
        screen_number: item.screens.screen_number,
        start_time: item.start_time,
      }));

      return res.status(200).json({ formattedData });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
