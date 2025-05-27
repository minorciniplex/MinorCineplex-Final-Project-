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

  const { movieId, date, cinemaName, province, page, pageSize } = req.query;

  // :white_check_mark: Validation
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
      let query = supabase
        .from("showtimes")
        .select(
          `
        start_time,
        showtime_id,
        date,
        screens!inner(
          screen_number,
          cinemas!inner(
            name,
            facilities,
            province
          )
        )
      `
        )
        .eq("movie_id", movieId)
        .eq("date", date);

      // Add cinema name filter if provided
      if (cinemaName) {
        query = query.ilike("screens.cinemas.name", `%${cinemaName}%`);
      }

      // Add province/city filter if provided
      if (province) {
        query = query.eq("screens.cinemas.province", province);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching showtimes data:", error);
        return res.status(500).json({ error: error });
      }

      if (!data) {
        return res.status(404).json({ error: "showtimes not found" });
      }
      // Transform the nested data structure to match the expected format
      const groupShowtimesByCinemaAndScreen = (data) => {
        const cinemaMap = new Map();

        data.forEach((showtime) => {
          const cinemaName = showtime.screens.cinemas.name;
          const screenNumber = showtime.screens.screen_number;
          const facilities = showtime.screens.cinemas.facilities;
          const date = showtime.date;
          const key = cinemaName;

          if (!cinemaMap.has(key)) {
            cinemaMap.set(key, {
              name: cinemaName,
              facilities: facilities,
              date: date,
              screens: {},
            });
          }

          const cinema = cinemaMap.get(key);

          if (!cinema.screens[screenNumber]) {
            cinema.screens[screenNumber] = [];
          }

          cinema.screens[screenNumber].push(
            showtime.start_time.substring(0, 5)
          );
        });

        return Array.from(cinemaMap.values());
      };
      const showtimesGrouped = groupShowtimesByCinemaAndScreen(data);

      // Calculate total for pagination
      const totalMovies = showtimesGrouped.length;

      // Apply pagination to the grouped data
      const pageNum = parseInt(page, 10) || 1;
      const pageSizeNum = parseInt(pageSize, 10) || 5;
      const startIndex = (pageNum - 1) * pageSizeNum;
      const endIndex = Math.min(startIndex + pageSizeNum, totalMovies);

      // Get just the movies for this page
      const paginatedMovies = showtimesGrouped.slice(startIndex, endIndex);

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
