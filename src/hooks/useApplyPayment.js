import { useState } from "react";
import axios from "axios";

export default function useApplyPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [checkingBooking, setCheckingBooking] = useState(false);

  // Check if booking exists
  const checkBookingExists = async (bookingId) => {
    if (!bookingId) {
      setError("bookingId ไม่มีค่า");
      throw new Error("bookingId ไม่มีค่า");
    }

    setCheckingBooking(true);
    setError(null);

    try {
      const response = await axios.get(`/api/booking/apply-payment?booking_id=${bookingId}`);
      return {
        exists: true,
        data: response.data.data
      };
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return {
          exists: false,
          data: null
        };
      }
      // Other errors
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("เกิดข้อผิดพลาดในการตรวจสอบข้อมูลการจอง");
      }
      throw err;
    } finally {
      setCheckingBooking(false);
    }
  };

  // Create new payment record
  const createPayment = async (paymentData) => {
    const response = await axios.post("/api/booking/apply-payment", paymentData);
    return response.data.data;
  };

  // Update existing payment record
  const updatePayment = async (paymentData) => {
    const response = await axios.put("/api/booking/apply-payment", paymentData);
    return response.data.data;
  };

  const applyPayment = async ({
    bookingId,
    userId,
    finalPrice,
    paymentMethod,
    payment_status
  }) => {
    // Validation
    if (!bookingId) {
      setError("bookingId ไม่มีค่า");
      throw new Error("bookingId ไม่มีค่า");
    }
    if (finalPrice === undefined || finalPrice === null) {
      setError("finalPrice ไม่มีค่า");
      throw new Error("finalPrice ไม่มีค่า");
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const paymentData = {
      booking_id: bookingId,
      user_id: userId,
      payment_method: paymentMethod,
      payment_status: payment_status || 'pending',
      amount: finalPrice,
    };

    try {
      // Check if booking exists
      const bookingCheck = await checkBookingExists(bookingId);
      
      let responseData;
      
      if (bookingCheck.exists) {
        responseData = await updatePayment(paymentData);
      } else {
        responseData = await createPayment(paymentData);
      }
      
      setResult(responseData);
      return responseData;

    } catch (err) {
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Manual check booking function (optional - for external use)
  const checkBooking = async (bookingId) => {
    try {
      return await checkBookingExists(bookingId);
    } catch (err) {
      throw err;
    }
  };

  return { 
    applyPayment, 
    checkBooking,
    loading, 
    checkingBooking,
    error, 
    result 
  };
}