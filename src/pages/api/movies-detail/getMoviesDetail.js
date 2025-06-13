import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "movie ID is required" });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select(
          `*,
      movie_genre_mapping (
      movie_genres (
        name
          )
        ), movie_languages (
        languages(
        name))
          `
        )
        .eq("movie_id", id)
        .single();

      if (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({ error: "Error fetching data" });
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
