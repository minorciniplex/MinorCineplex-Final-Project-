import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase;
  const user = req.user;
  if (req.method === "POST") {
    const {
      booking_id,
      payment_method,
      payment_status,
      amount,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !booking_id ||
      !payment_method ||
      !payment_status ||
      amount === undefined
    ) {
      return res.status(400).json({
        error: "กรุณากรอกข้อมูลให้ครบถ้วน (booking_id, payment_method, payment_status,  amount)",
      });
    }

    try {
      const { data, error } = await supabase
        .from("payments")
        .insert({
          booking_id,
          payment_method,
          payment_status,
          amount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        // กรณี error จาก Supabase
        return res.status(500).json({
          error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message,
        });
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      // กรณี error จากระบบ
      return res.status(500).json({
        error: "เกิดข้อผิดพลาดของระบบ: " + error.message,
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};
export default withMiddleware([requireUser], handler);