import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;

  if (req.method === "GET") {
    const { booking_id } = req.query;

    if (!booking_id) {
      return res.status(400).json({
        error: "กรุณาระบุ booking_id",
      });
    }

    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", booking_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return res.status(404).json({
            error: "ไม่พบข้อมูลการชำระเงินสำหรับการจองนี้",
          });
        }
        return res.status(500).json({
          error: "เกิดข้อผิดพลาดในการค้นหาข้อมูล: " + error.message,
        });
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      return res.status(500).json({
        error: "เกิดข้อผิดพลาดของระบบ: " + error.message,
      });
    }
  }

  if (req.method === "POST") {
    const { booking_id, user_id, payment_method, payment_status, amount } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !booking_id ||
      !payment_method ||
      !payment_status ||
      amount === undefined
    ) {
      return res.status(400).json({
        error:
          "กรุณากรอกข้อมูลให้ครบถ้วน (booking_id, payment_method, payment_status, amount)",
      });
    }

    try {
      const { data, error } = await supabase.from("payments").insert({
        booking_id,
        user_id,
        payment_method,
        payment_status,
        amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return res.status(500).json({
          error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message,
        });
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      return res.status(500).json({
        error: "เกิดข้อผิดพลาดของระบบ: " + error.message,
      });
    }
  }

  if (req.method === "PUT") {
    const { booking_id, user_id, payment_method, payment_status, amount } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !booking_id ||
      !user_id ||
      !payment_method ||
      !payment_status ||
      amount === undefined
    ) {
      return res.status(400).json({
        error:
          "กรุณากรอกข้อมูลให้ครบถ้วน (booking_id, user_id, payment_method, payment_status, amount)",
      });
    }

    try {
      // Check if the payment record exists and belongs to the user
      const { data: existingPayment, error: checkError } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", booking_id)
        .eq("user_id", user_id)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return res.status(404).json({
            error: "ไม่พบข้อมูลการชำระเงินสำหรับการจองนี้หรือไม่มีสิทธิ์เข้าถึง",
          });
        }
        return res.status(500).json({
          error: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล: " + checkError.message,
        });
      }

      // Update the payment record
      const { data, error } = await supabase
        .from("payments")
        .update({
          payment_method,
          payment_status,
          amount,
          updated_at: new Date().toISOString(),
        })
        .eq("booking_id", booking_id)
        .eq("user_id", user_id);

      if (error) {
        return res.status(500).json({
          error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล: " + error.message,
        });
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      return res.status(500).json({
        error: "เกิดข้อผิดพลาดของระบบ: " + error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default withMiddleware([requireUser], handler);