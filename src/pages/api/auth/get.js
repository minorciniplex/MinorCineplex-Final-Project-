import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const { data, error } = await supabase
                .from("movies")
                .select("poster_url")
                .eq("title", "Black Widow")
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
