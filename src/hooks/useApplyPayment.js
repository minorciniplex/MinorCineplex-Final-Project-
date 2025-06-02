import { useState } from "react";
import axios from "axios";

export default function useApplyPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const applyPayment = async ({
    booking_id,
    payment_method,
    payment_status,
    amount,
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post("/api/booking/apply-payment", {
        booking_id: "13456937-0307-46e2-84ed-756190e13fbd",
        payment_method: "credit_card",
        payment_status: "pending",
        amount: 350.00,
      });
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