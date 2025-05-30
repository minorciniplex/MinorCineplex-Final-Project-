import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient({ req, res });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bookingId, seats } = req.body; // เปลี่ยนจาก seat เป็น seats

  if (!bookingId || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: "Missing required parameters or invalid seats array" });
  }

  try {
    const insertedSeats = [];
    
    // Loop insert ทีละที่นั่ง
    for (const seat of seats) {
      const { data, error } = await supabase
        .from("booking_seat")
        .insert([{ booking_id: bookingId, seat }]);

      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        insertedSeats.push(data[0]);
      }
    }

    return res.status(200).json({ 
      message: "Seats booked successfully", 
      seats: insertedSeats 
    });
  } catch (error) {
    console.error("Error inserting booking seat:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}