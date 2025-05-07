import requireUser from "@/middleware/requireUser";
import { withMiddleware } from "@/middleware/withMiddleware";

const handler = async (req, res) => {
  const supabase = req.supabase; // ไม่ต้องสร้างใหม่แล้ว

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("poster_url")
        .eq("title", "Spider-Man: No Way Home")
        .single();

      if (error) {
        console.error("Error fetching profile data:", error);
        return res.status(500).json({ error: "Error fetching Picture data" });
      }

      return res.status(200).json({ data });
    } catch (error) {
      console.error("Error in GET request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default withMiddleware([requireUser], handler);
