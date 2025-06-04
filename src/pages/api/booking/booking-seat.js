import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "POST") {
    const { showtimeId, seatNumber, sumPrice } = req.body;

    console.log("=== BOOKING SEAT REQUEST ===");
    console.log("User ID:", user.id);
    console.log("Showtime ID:", showtimeId);
    console.log("Seat Numbers:", seatNumber);
    console.log("Total Price:", sumPrice);

    // Validate input
    if (!showtimeId || !seatNumber || !Array.isArray(seatNumber) || seatNumber.length === 0) {
      console.error("Validation failed: Missing required fields");
      return res.status(400).json({ error: "Missing required fields or invalid seat data" });
    }

    // Validate sumPrice
    if (!sumPrice || isNaN(sumPrice) || sumPrice <= 0) {
      console.error("Validation failed: Invalid price");
      return res.status(400).json({ error: "Invalid price value" });
    }

    try {
      // Check if any seat is already booked/reserved
      console.log("Checking seat availability...");
      for (const seat of seatNumber) {
        // Extract row and seat number from seat format (e.g., "E7" -> row: "E", seat: "7")
        const row = seat.charAt(0);
        const seatNum = seat.slice(1);

        // Check if seat exists and is already taken
        const { data: existingSeat, error: seatCheckError } = await supabase
          .from("seats")
          .select("*")
          .eq("row", row)
          .eq("seat_number", seatNum)
          .eq("showtime_id", showtimeId);

        if (seatCheckError) {
          console.error("Error checking existing seat:", seatCheckError);
          return res.status(500).json({ 
            error: "Database error while checking seat availability",
            details: process.env.NODE_ENV === 'development' ? seatCheckError : undefined
          });
        }

        // If seat exists and is booked/reserved by someone else
        if (existingSeat && existingSeat.length > 0) {
          const existingSeatData = existingSeat[0];
          if (existingSeatData.seat_status === 'booked' || 
              (existingSeatData.seat_status === 'reserved' && existingSeatData.reserved_by !== user.id)) {
            console.log(`Seat ${seat} is already taken:`, existingSeatData);
            return res.status(409).json({ error: `Seat ${seat} is already booked` });
          }
        }
      }

      // Create a new booking
      console.log("Creating new booking...");
      const bookingData = {
        user_id: user.id,
        showtime_id: showtimeId, // Keep as UUID string, don't parseInt
        booking_date: new Date().toISOString(),
        total_price: parseFloat(sumPrice),
        status: "reserved",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      };

      console.log("Booking data to insert:", bookingData);

      const { data: bookingResult, error: bookingError } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select();

      if (bookingError) {
        console.error("Error creating booking:", bookingError);
        return res.status(500).json({ 
          error: "Failed to create booking",
          details: process.env.NODE_ENV === 'development' ? bookingError : undefined
        });
      }

      if (!bookingResult || bookingResult.length === 0) {
        console.error("No booking data returned");
        return res.status(500).json({ error: "Booking created but no data returned" });
      }

      const bookingId = bookingResult[0].booking_id;
      console.log("Booking created successfully, ID:", bookingId);

      // Insert all seats - check if they already exist and update them
      console.log("Inserting/updating seat reservations...");
      
      const seatUpdatePromises = seatNumber.map(async (seat) => {
        const row = seat.charAt(0);
        const seatNum = seat.slice(1);
        
        // First try to update existing seat
        const { data: updateResult, error: updateError } = await supabase
          .from("seats")
          .update({
            seat_status: "reserved",
            reserved_by: user.id,
            updated_at: new Date().toISOString()
                     })
           .eq('seat_id', seat)
           .eq('showtime_id', showtimeId) // Keep as UUID string
           .select();

        // If no existing seat found, create new one
        if (!updateResult || updateResult.length === 0) {
          const { data: insertResult, error: insertError } = await supabase
            .from("seats")
            .insert({
              seat_id: seat,
              row: row,
              seat_number: parseInt(seatNum),
              showtime_id: showtimeId, // Keep as UUID string
              seat_status: "reserved",
              reserved_by: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();

          if (insertError) {
            console.error(`Error inserting seat ${seat}:`, insertError);
            throw insertError;
          }
          return insertResult[0];
        }

        if (updateError) {
          console.error(`Error updating seat ${seat}:`, updateError);
          throw updateError;
        }
        return updateResult[0];
      });

      let seatData;
      try {
        seatData = await Promise.all(seatUpdatePromises);
        console.log("Seat operations completed:", seatData.length);
             } catch (seatError) {
         console.error("Error with seat operations:", seatError);
         // Try to cleanup the booking
         await supabase.from("bookings").delete().eq("booking_id", bookingId);
         return res.status(500).json({ 
           error: "Failed to reserve seats",
           details: process.env.NODE_ENV === 'development' ? seatError : undefined
         });
       }

       console.log("Seat operations result:", { seatData, seatCount: seatData?.length });

      // Insert booking_seats junction records
      console.log("Creating booking-seat junction records...");
      const bookingSeatInserts = seatNumber.map(seat => ({
        seat_id: seat,
        showtime_id: showtimeId, // Keep as UUID string
        booking_id: bookingId,
        created_at: new Date().toISOString()
      }));

      console.log("Booking seat inserts:", bookingSeatInserts);

      const { data: bookingSeatData, error: bookingSeatError } = await supabase
        .from("booking_seats")
        .insert(bookingSeatInserts)
        .select();

      if (bookingSeatError) {
        console.error("Error creating booking seats junction:", bookingSeatError);
        // Cleanup on error  
        await supabase.from("seats").delete().eq("showtime_id", showtimeId).eq("reserved_by", user.id);
        await supabase.from("bookings").delete().eq("booking_id", bookingId);
        return res.status(500).json({ 
          error: "Failed to create booking-seat association",
          details: process.env.NODE_ENV === 'development' ? bookingSeatError : undefined
        });
      }

      console.log("=== BOOKING SUCCESS ===");
      console.log("Booking ID:", bookingId);
      console.log("Seats reserved:", seatData?.length);
      console.log("Junction records created:", bookingSeatData?.length);

      return res.status(201).json({ 
        data: bookingResult,
        seatData: seatData,
        bookingSeatData: bookingSeatData,
        message: "Booking created successfully"
      });

    } catch (error) {
      console.error("=== BOOKING ERROR ===");
      console.error("Error in POST request:", error);
      console.error("Stack trace:", error.stack);
      return res.status(500).json({ 
        error: "Internal Server Error",
        message: "An unexpected error occurred while processing your booking",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler);