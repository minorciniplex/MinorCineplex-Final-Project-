import { createSupabaseServerClient } from "@/utils/supabaseCookie";

const handler = async (req, res) => {
  const supabase = createSupabaseServerClient(req, res);
  const { user_id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Validate user_id format if needed
    if (typeof user_id !== 'string' || user_id.trim() === '') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return res.status(500).json({ 
        error: "Failed to fetch bookings",
        details: bookingsError.message 
      });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ 
        message: "No bookings found",
        user_id: user_id 
      });
    }

    const bookingIds = bookings.map((booking) => booking.booking_id);
    const showtimeIds = bookings.map((booking) => booking.showtime_id);

    const { data: bookingSeats, error: bookingSeatsError } = await supabase
      .from("booking_seats")
      .select("*")
      .in("booking_id", bookingIds)
      .in("showtime_id", showtimeIds);

    if (bookingSeatsError) {
      console.error("Error fetching booking seats:", bookingSeatsError);
      return res.status(500).json({ 
        error: "Failed to fetch booking seats",
        details: bookingSeatsError.message 
      });
    }

    if (!bookingSeats || bookingSeats.length === 0) {
      return res.status(404).json({ 
        message: "No booking seats found",
        booking_ids: bookingIds 
      });
    }

    const { data: showtimes, error: showtimesError } = await supabase
      .from("showtimes")
      .select("*")
      .in("showtime_id", showtimeIds);

    if (showtimesError) {
      console.error("Error fetching showtimes:", showtimesError);
      return res.status(500).json({ 
        error: "Failed to fetch showtimes",
        details: showtimesError.message 
      });
    }

    if (!showtimes || showtimes.length === 0) {
      return res.status(404).json({ 
        message: "No showtimes found",
        showtime_ids: showtimeIds 
      });
    }

    const { data: screens, error: screensError } = await supabase
      .from("screens")
      .select("*")
      .in("screen_id", showtimes.map((showtime) => showtime.screen_id));

    if (screensError) {
      console.error("Error fetching screens:", screensError);
      return res.status(500).json({ 
        error: "Failed to fetch screens",
        details: screensError.message 
      });
    }

    if (!screens || screens.length === 0) {
      return res.status(404).json({ 
        message: "No screens found",
        screen_ids: showtimes.map((showtime) => showtime.screen_id) 
      });
    }

    const { data: cinemas, error: cinemasError } = await supabase
      .from("cinemas")
      .select("*")
      .in("cinema_id", screens.map((screen) => screen.cinema_id));

    if (cinemasError) {
      console.error("Error fetching cinemas:", cinemasError);
      return res.status(500).json({ 
        error: "Failed to fetch cinemas",
        details: cinemasError.message 
      });
    }

    if (!cinemas || cinemas.length === 0) {
      return res.status(404).json({ 
        message: "No cinemas found",
        cinema_ids: screens.map((screen) => screen.cinema_id) 
      });
    }

    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select("*")
      .in("movie_id", showtimes.map((showtime) => showtime.movie_id));

    if (moviesError) {
      console.error("Error fetching movies:", moviesError);
      return res.status(500).json({ 
        error: "Failed to fetch movies",
        details: moviesError.message 
      });
    }

    if (!movies || movies.length === 0) {
      return res.status(404).json({ 
        message: "No movies found",
        movie_ids: showtimes.map((showtime) => showtime.movie_id) 
      });
    }

    const groupedBookings = bookings.map((booking) => {
      const relatedShowtime = showtimes.find(
        (s) => s.showtime_id === booking.showtime_id
      );
      const relatedMovie = movies.find(
        (m) => m.movie_id === relatedShowtime.movie_id
      );
      const relatedScreen = screens.find(
        (sc) => sc.screen_id === relatedShowtime.screen_id
      );
      const relatedSeats = bookingSeats
        .filter((bs) => bs.booking_id === booking.booking_id)
        .map((bs) => bs.seat_id);
      const relatedCinema = cinemas.find(
        (c) => c.cinema_id === relatedScreen.cinema_id
      );  

      return {
        booking_id: booking.booking_id,
        booking_date: booking.booking_date,
        total_price: booking.total_price,
        status: booking.status,
        movie: {
          title: relatedMovie.title,
          duration: relatedMovie.duration,
          rating: relatedMovie.rating,
          age_rating: relatedMovie.age_rating,
          poster_url: relatedMovie.poster_url,
          description: relatedMovie.description,
        },
        showtime: {
          date: relatedShowtime.date,
          start_time: relatedShowtime.start_time,
        },
        screen: {
          screen_number: relatedScreen.screen_number,
          screen_type: relatedScreen.screen_type,
          price_per_seat: relatedScreen.price,
        },
        seats: relatedSeats,
        cinema: {
          name: relatedCinema.name,
          address: relatedCinema.address,
        },
      };
    });

    return res.status(200).json({ data: groupedBookings });
  } catch (error) {
    console.error("Unexpected error in booking history handler:", error);
    return res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export default handler;