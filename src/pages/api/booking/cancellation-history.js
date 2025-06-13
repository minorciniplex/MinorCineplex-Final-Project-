import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "GET") {
    try {
      // Fetch cancellation history with related booking and movie details
      const { data: cancellations, error: cancellationError } = await supabase
        .from("booking_cancellations")
        .select(`
          *,
          bookings (
            booking_id,
            total_price,
            booking_date,
            showtimes (
              date,
              start_time,
              movies (
                title,
                poster_url
              ),
              screens (
                screen_number,
                cinemas (
                  name,
                  address
                )
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("cancellation_date", { ascending: false });

      if (cancellationError) {
        console.error("Error fetching cancellation history:", cancellationError);
        return res.status(500).json({ error: "Failed to fetch cancellation history" });
      }

      // Format the response data
      const formattedCancellations = cancellations.map(cancellation => ({
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
          title: cancellation.bookings.showtimes.movies.title,
          poster_url: cancellation.bookings.showtimes.movies.poster_url
        },
        showtime: {
          date: cancellation.bookings.showtimes.date,
          start_time: cancellation.bookings.showtimes.start_time
        },
        cinema: {
          name: cancellation.bookings.showtimes.screens.cinemas.name,
          address: cancellation.bookings.showtimes.screens.cinemas.address
        },
        screen: {
          screen_number: cancellation.bookings.showtimes.screens.screen_number
        }
      }));

      return res.status(200).json({
        success: true,
        data: formattedCancellations
      });

    } catch (error) {
      console.error("Error in cancellation history API:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler); 