import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
    
    const supabase = createSupabaseServerClient(req, res);
    const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
    
      if (!user || userError) {
        return res.status(401).json({ error: "Unauthorized: Please login first." });
      }
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
}
