import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
        *
        `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching booking history:", error);
      return res.status(500).json({ error: error });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const bookingIds = bookings.map((booking) => booking.booking_id);
    const showtimeIds = bookings.map((booking) => booking.showtime_id);
    const { data: bookingSeats, error: bookingSeatsError } = await supabase
      .from("booking_seats")
      .select(
        `
            *
        `
      )
      .in("booking_id", bookingIds)
      .in("showtime_id", showtimeIds);
    if (bookingSeatsError) {
      console.error("Error fetching booking seats:", bookingSeatsError);
      return res.status(500).json({ error: bookingSeatsError });
    }

    if (!bookingSeats || bookingSeats.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const { data: showtimes, error: showtimesError } = await supabase
      .from("showtimes")
      .select(
        `
            *
        `
      )
      .in("showtime_id", showtimeIds);
    if (showtimesError) {
      console.error("Error fetching showtimes:", showtimesError);
      return res.status(500).json({ error: showtimesError });
    }
    if (!showtimes || showtimes.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const { data: screens, error: screensError } = await supabase
      .from("screens")
      .select(
        `
            *
        `
      )
      .in(
        "screen_id",
        showtimes.map((showtime) => showtime.screen_id)
      );
    if (screensError) {
      console.error("Error fetching screens:", screensError);
      return res.status(500).json({ error: screensError });
    }

    if (!screens || screens.length === 0) {
      return res.status(200).json({ data: [] });
    }
    const { data: cinemas, error: cinemasError } = await supabase
      .from("cinemas")
      .select(
        `
            *
        `
      )
      .in(
        "cinema_id",
        screens.map((screen) => screen.cinema_id)
      );

    if (cinemasError) {
      console.error("Error fetching cinemas:", cinemasError);
      return res.status(500).json({ error: cinemasError });
    }
    if (!cinemas || cinemas.length === 0) {
      return res.status(200).json({ data: [] });
    }
    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select(
        `
            *
        `
      )
      .in(
        "movie_id",
        showtimes.map((showtime) => showtime.movie_id)
      );

    if (moviesError) {
      console.error("Error fetching movies:", moviesError);
      return res.status(500).json({ error: moviesError });
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(
        `
            *
        `
      )
      .in(
        "booking_id",
        bookings.map((booking) => booking.booking_id)
      );

    if (paymentError) {
      console.error("Error fetching payments:", paymentError);
      return res.status(500).json({ error: paymentError });
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
      const relatedPayment = payment.find(
        (p) => p.booking_id === booking.booking_id
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
        payment: {
          payment_id: relatedPayment ? relatedPayment.payment_id : null,
          amount: relatedPayment ? relatedPayment.amount : null,
          payment_method: relatedPayment ? relatedPayment.payment_method : null,
          payment_status: relatedPayment ? relatedPayment.payment_status : null,
        },
      };
    });

    return res.status(200).json({ data: groupedBookings });
  } catch (error) {
    console.error("Error in booking history handler:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default withMiddleware([requireUser], handler);