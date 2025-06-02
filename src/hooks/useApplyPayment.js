import { useState } from "react";
import axios from "axios";

export default function useApplyPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const applyPayment = async ({
    bookingId,
    finalPrice,
  }) => {
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
    try {
      console.log("applyPayment ส่ง:", {
        booking_id: bookingId,
        payment_method: 'credit_card',
        payment_status: 'pending',
        amount: finalPrice,
      });
      const response = await axios.post("/api/booking/apply-payment", {
        booking_id: bookingId,
        payment_method: 'credit_card',
        payment_status: 'pending',
        amount: finalPrice,
      });
      console.log(response.data.data);
      setResult(response.data.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    } finally {
      setLoading(false);
    }
  };

  return { applyPayment, loading, error, result };
}