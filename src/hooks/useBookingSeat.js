import axios from "axios";
import { useState } from "react";


const useBookingSeat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = async (paymentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { showtimeId, seatNumber, sumPrice, bookingId } = paymentData;

      // Validate required fields
      if (!showtimeId || !seatNumber || !Array.isArray(seatNumber) || seatNumber.length === 0 || !bookingId) {
        throw new Error("Missing required fields or invalid data");
      }

      const response = await axios.post("/api/booking/payment-seat", {
        showtimeId,
        seatNumber,
        sumPrice,
        bookingId
      });

      if (response.status === 200) {
        console.log("Payment successful:", response.data);
        return {
          success: true,
          data: response.data
        };
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Payment failed";
      setError(errorMessage);
      
      
      console.error("Payment error:", error);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function สำหรับ reset state
  const resetPaymentState = () => {
    setError(null);
    setIsLoading(false);
  };

  return {
    processPayment,
    isLoading,
    error,
    resetPaymentState
  };
};

export default useBookingSeat;