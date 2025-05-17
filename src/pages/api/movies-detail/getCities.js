import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase.from("cinemas").select("province");

      if (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({ error: "Error fetching data" });
      }

      let cities = [];
      if (data) {
        cities = data.reduce((acc, current) => {
          if (!acc.find((item) => item.province === current.province)) {
            acc.push(current);
          }
          return acc;
        }, []);
      }

      return res.status(200).json({ cities });
    } catch (error) {
      console.error("Error in GET request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
