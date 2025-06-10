import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "GET") {
    try {
      console.log("Fetching simple cancellation history for user:", user.id);
      
      // First, get cancellation records
      const { data: cancellations, error: cancellationError } = await supabase
        .from("booking_cancellations")
        .select("*")
        .eq("user_id", user.id)
        .order("cancellation_date", { ascending: false });

      console.log("Raw cancellations:", cancellations?.length || 0);
      if (cancellationError) {
        console.error("Error fetching cancellations:", cancellationError);
        return res.status(500).json({ error: "Failed to fetch cancellation history" });
      }

      if (!cancellations || cancellations.length === 0) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      // Get booking IDs to fetch related data
      const bookingIds = cancellations.map(c => c.booking_id);
      console.log("Booking IDs:", bookingIds);

      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("booking_id, total_price, booking_date, showtime_id")
        .in("booking_id", bookingIds);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        return res.status(500).json({ error: "Failed to fetch booking details" });
      }

      // Get showtime IDs
      const showtimeIds = bookings.map(b => b.showtime_id);
      console.log("Showtime IDs:", showtimeIds);

      // Fetch showtimes data
      const { data: showtimes, error: showtimesError } = await supabase
        .from("showtimes")
        .select("showtime_id, date, start_time, movie_id, screen_id")
        .in("showtime_id", showtimeIds);

      if (showtimesError) {
        console.error("Error fetching showtimes:", showtimesError);
        return res.status(500).json({ error: "Failed to fetch showtime details" });
      }

      // Get movie and screen IDs
      const movieIds = [...new Set(showtimes.map(s => s.movie_id))];
      const screenIds = [...new Set(showtimes.map(s => s.screen_id))];

      // Fetch movies
      const { data: movies, error: moviesError } = await supabase
        .from("movies")
        .select("movie_id, title, poster_url")
        .in("movie_id", movieIds);

      if (moviesError) {
        console.error("Error fetching movies:", moviesError);
        return res.status(500).json({ error: "Failed to fetch movie details" });
      }

      // Fetch screens
      const { data: screens, error: screensError } = await supabase
        .from("screens")
        .select("screen_id, screen_number, cinema_id")
        .in("screen_id", screenIds);

      if (screensError) {
        console.error("Error fetching screens:", screensError);
        return res.status(500).json({ error: "Failed to fetch screen details" });
      }

      // Get cinema IDs
      const cinemaIds = [...new Set(screens.map(s => s.cinema_id))];

      // Fetch cinemas
      const { data: cinemas, error: cinemasError } = await supabase
        .from("cinemas")
        .select("cinema_id, name, address")
        .in("cinema_id", cinemaIds);

      if (cinemasError) {
        console.error("Error fetching cinemas:", cinemasError);
        return res.status(500).json({ error: "Failed to fetch cinema details" });
      }

      // Combine all data
      const formattedCancellations = cancellations.map(cancellation => {
        const booking = bookings.find(b => b.booking_id === cancellation.booking_id);
        if (!booking) return null;

        const showtime = showtimes.find(s => s.showtime_id === booking.showtime_id);
        if (!showtime) return null;

        const movie = movies.find(m => m.movie_id === showtime.movie_id);
        const screen = screens.find(s => s.screen_id === showtime.screen_id);
        const cinema = screen ? cinemas.find(c => c.cinema_id === screen.cinema_id) : null;

        return {
          cancellationId: cancellation.cancellation_id,
          bookingId: cancellation.booking_id,
          cancellationReason: cancellation.cancellation_reason,
          originalAmount: cancellation.original_total_price,
          refundAmount: cancellation.refund_amount,
          refundPercentage: cancellation.refund_percentage,
          refundStatus: cancellation.refund_status,
          cancellationDate: cancellation.cancellation_date,
          hoursBeforeShowtime: cancellation.hours_before_showtime,
          movie: {
            title: movie?.title || 'Unknown Movie',
            poster_url: movie?.poster_url || null
          },
          showtime: {
            date: showtime.date,
            start_time: showtime.start_time
          },
          cinema: {
            name: cinema?.name || 'Unknown Cinema',
            address: cinema?.address || ''
          },
          screen: {
            screen_number: screen?.screen_number || 0
          }
        };
      }).filter(Boolean);

      console.log("Formatted cancellations:", formattedCancellations.length);

      return res.status(200).json({
        success: true,
        data: formattedCancellations
      });

    } catch (error) {
      console.error("Error in cancellation history API:", error);
      return res.status(500).json({ 
        error: "Internal Server Error",
        details: error.message 
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler); 