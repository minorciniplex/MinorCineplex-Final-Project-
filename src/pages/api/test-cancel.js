export default function handler(req, res) {
  if (req.method === "POST") {
    const { bookingId, cancellationReason } = req.body;
    
    return res.status(200).json({
      success: true,
      message: "Test API working - Booking cancelled successfully",
      data: {
        bookingId: bookingId,
        refundAmount: 0,
        refundPercentage: 0,
        cancellationReason: cancellationReason
      }
    });
  }
  
  return res.status(405).json({ error: "Method not allowed" });
} 