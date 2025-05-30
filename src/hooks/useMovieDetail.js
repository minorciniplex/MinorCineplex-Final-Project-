import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";

export function useMovieDetail(movie_id) {
  const [movie, setMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [showtime, setShowtime] = useState(null);
  const [hall, setHall] = useState(null);
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // 1. ดึงข้อมูลหนัง
      const { data: movieData } = await supabase
        .from("movies")
        .select("*")
        .eq("movie_id", movie_id)
        .single();
      setMovie(movieData);

      // 2. ดึง genre
      const { data: mappings } = await supabase
        .from("movie_genre_mapping")
        .select("genre_id")
        .eq("movie_id", movie_id);
      const genreIds = mappings?.map(m => m.genre_id) || [];
      const { data: genresData } = await supabase
        .from("movie_genres")
        .select("name")
        .in("genre_id", genreIds);
      setGenres(genresData?.map(g => g.name) || []);

      // 3. ดึงภาษา
      const { data: langs } = await supabase
        .from("movie_languages")
        .select("language_id, language_type")
        .eq("movie_id", movie_id);
      const langIds = langs?.map(l => l.language_id) || [];
      const { data: langData } = await supabase
        .from("languages")
        .select("code, name")
        .in("language_id", langIds);
      setLanguages(langData?.map(l => l.code) || []);

      // 4. ดึงรอบฉาย (showtime) ล่าสุด
      const { data: showtimes } = await supabase
        .from("showtimes")
        .select("*")
        .eq("movie_id", movie_id)
        .order("date", { ascending: true })
        .limit(1);
      if (showtimes && showtimes.length > 0) {
        setShowtime(showtimes[0]);
        // 5. ดึง hall/screen
        const { data: screen } = await supabase
          .from("screens")
          .select("*")
          .eq("screen_id", showtimes[0].screen_id)
          .single();
        setHall(screen);

        // 6. ดึง cinema
        const { data: cinemaData } = await supabase
          .from("cinemas")
          .select("*")
          .eq("cinema_id", screen.cinema_id)
          .single();
        setCinema(cinemaData);
      }
      setLoading(false);
    }
    if (movie_id) fetchData();
  }, [movie_id]);

  return { movie, genres, languages, showtime, hall, cinema, loading };
} 