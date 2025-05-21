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
  const { cinemaId, date, page, pageSize } = req.query;

  // ✅ Validation
  if (!cinemaId || !date) {
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

      const showtimesGrouped = formattedData.reduce((acc, showtime) => {
        const { movie_id, movie_title, poster_url, genre, language_code } =
          showtime;

        if (!acc[movie_id]) {
          acc[movie_id] = {
            id: movie_id,
            title: movie_title,
            posterUrl: poster_url,
            genre,
            languageCode: language_code,
            halls: {},
          };
        }

        // Group by hall/screen
        const hallNumber = `Hall ${showtime.screen_number}`;
        if (!acc[movie_id].halls[hallNumber]) {
          acc[movie_id].halls[hallNumber] = [];
        }

        // Add showtime to this hall
        acc[movie_id].halls[hallNumber].push(
          showtime.start_time.substring(0, 5)
        ); // Extract HH:MM from time

        return acc;
      }, {});

      // Convert from object to array for pagination and frontend
      const allMovies = Object.values(showtimesGrouped).sort(
        (a, b) =>
          Object.keys(b.halls).length - Object.keys(a.halls).length ||
          a.title.localeCompare(b.title)
      );

      // Calculate total for pagination
      const totalMovies = allMovies.length;

      // Apply pagination to the grouped data
      const pageNum = parseInt(page, 10) || 1;
      const pageSizeNum = parseInt(pageSize, 10) || 5;
      const startIndex = (pageNum - 1) * pageSizeNum;
      const endIndex = Math.min(startIndex + pageSizeNum, totalMovies);

      // Get just the movies for this page
      const paginatedMovies = allMovies.slice(startIndex, endIndex);

      // Format response to match your interface
      res.status(200).json({
        data: {
          showtimes: paginatedMovies,
          pagination: {
            total: totalMovies,
            page: pageNum,
            pageSize: pageSizeNum,
            totalPages: Math.ceil(totalMovies / pageSizeNum),
            hasMore: pageNum < Math.ceil(totalMovies / pageSizeNum),
          },
        },
      });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
