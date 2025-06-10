import { createSupabaseServerClient } from "@/utils/supabaseCookie";

const handler = async (req, res) => {
  const supabase = createSupabaseServerClient(req, res);
  const { booking_id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!booking_id) {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  try {
    // Validate booking_id format if needed
    if (typeof booking_id !== 'string' || booking_id.trim() === '') {
      return res.status(400).json({ error: "Invalid booking ID format" });
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_id", booking_id)
      .single();

    if (bookingsError) {
      console.error("Error fetching booking:", bookingsError);
      return res.status(500).json({ 
        error: "Failed to fetch booking",
        details: bookingsError.message 
      });
    }

    if (!bookings) {
      return res.status(404).json({ 
        message: "No booking found",
        booking_id: booking_id 
      });
    }

    const { data: bookingSeats, error: bookingSeatsError } = await supabase
      .from("booking_seats")
      .select("*")
      .eq("booking_id", booking_id);

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
        booking_id: booking_id 
      });
    }

    const { data: showtimes, error: showtimesError } = await supabase
      .from("showtimes")
      .select("*")
      .eq("showtime_id", bookings.showtime_id)
      .single();

    if (showtimesError) {
      console.error("Error fetching showtime:", showtimesError);
      return res.status(500).json({ 
        error: "Failed to fetch showtime",
        details: showtimesError.message 
      });
    }

    if (!showtimes) {
      return res.status(404).json({ 
        message: "No showtime found",
        showtime_id: bookings.showtime_id 
      });
    }

    const { data: screens, error: screensError } = await supabase
      .from("screens")
      .select("*")
      .eq("screen_id", showtimes.screen_id)
      .single();

    if (screensError) {
      console.error("Error fetching screen:", screensError);
      return res.status(500).json({ 
        error: "Failed to fetch screen",
        details: screensError.message 
      });
    }

    if (!screens) {
      return res.status(404).json({ 
        message: "No screen found",
        screen_id: showtimes.screen_id 
      });
    }

    const { data: cinemas, error: cinemasError } = await supabase
      .from("cinemas")
      .select("*")
      .eq("cinema_id", screens.cinema_id)
      .single();

    if (cinemasError) {
      console.error("Error fetching cinema:", cinemasError);
      return res.status(500).json({ 
        error: "Failed to fetch cinema",
        details: cinemasError.message 
      });
    }

    if (!cinemas) {
      return res.status(404).json({ 
        message: "No cinema found",
        cinema_id: screens.cinema_id 
      });
    }

    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select("*")
      .eq("movie_id", showtimes.movie_id)
      .single();

    if (moviesError) {
      console.error("Error fetching movie:", moviesError);
      return res.status(500).json({ 
        error: "Failed to fetch movie",
        details: moviesError.message 
      });
    }

    if (!movies) {
      return res.status(404).json({ 
        message: "No movie found",
        movie_id: showtimes.movie_id 
      });
    }

    const relatedSeats = bookingSeats.map((bs) => bs.seat_id);

    const groupedBooking = {
      booking_id: bookings.booking_id,
      showtime_id: bookings.showtime_id,
      booking_date: bookings.booking_date,
      total_price: bookings.total_price,
      status: bookings.status,
      movie: {
        title: movies.title,
        duration: movies.duration,
        rating: movies.rating,
        age_rating: movies.age_rating,
        poster_url: movies.poster_url,
        description: movies.description,
      },
      showtime: {
        date: showtimes.date,
        start_time: showtimes.start_time,
      },
      screen: {
        screen_number: screens.screen_number,
        screen_type: screens.screen_type,
        price_per_seat: screens.price,
      },
      seats: relatedSeats,
      cinema: {
        name: cinemas.name,
        address: cinemas.address,
      },
    };

    return res.status(200).json({ data: groupedBooking });
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