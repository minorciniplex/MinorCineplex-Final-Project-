export default function handler(req, res) {
  console.log("Test API called");
  console.log("Method:", req.method);
  console.log("Body:", req.body);
  
  if (req.method === "POST") {
    const { bookingId, cancellationReason } = req.body;
    
    return res.status(200).json({
      success: true,
      message: "Test API working - Booking cancelled successfully",
      data: {
        bookingId: bookingId,
        refundAmount: 250,
        refundPercentage: 100,
        cancellationReason: cancellationReason
      }
    });
  }
  
  return res.status(405).json({ error: "Method not allowed" });
} 