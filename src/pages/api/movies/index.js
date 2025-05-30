import supabase from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { type, filters } = req.query;
      const today = new Date().toISOString().split('T')[0];
      let query = supabase.from('movies').select('*');
      let filteredMovieIds = null;
      let filterObj = {};
      if (filters) {
        filterObj = JSON.parse(filters);
      }

      // Filter by language (join กับ movie_languages)
      if (filterObj.language) {
        const { data: movieLangs, error: langError } = await supabase
          .from('movie_languages')
          .select('movie_id')
          .eq('language_id', filterObj.language)
          .eq('language_type', 'original');
        if (langError) throw langError;
        const langMovieIds = movieLangs ? movieLangs.map(m => m.movie_id) : [];
        filteredMovieIds = langMovieIds;
      }

      // Filter by city (province)
      if (filterObj.city) {
        const { data: cinemas } = await supabase
          .from('cinemas')
          .select('cinema_id')
          .eq('province', filterObj.city);
        const cinemaIds = cinemas ? cinemas.map(c => c.cinema_id) : [];
        const { data: screens } = await supabase
          .from('screens')
          .select('screen_id')
          .in('cinema_id', cinemaIds);
        const screenIds = screens ? screens.map(s => s.screen_id) : [];
        let showtimeQuery = supabase
          .from('showtimes')
          .select('movie_id');
        if (screenIds.length > 0) showtimeQuery = showtimeQuery.in('screen_id', screenIds);
        if (filterObj.releaseDate) showtimeQuery = showtimeQuery.eq('date', filterObj.releaseDate);
        const { data: showtimes } = await showtimeQuery;
        const cityMovieIds = showtimes ? Array.from(new Set(showtimes.map(st => st.movie_id))) : [];
        if (filteredMovieIds) {
          filteredMovieIds = filteredMovieIds.filter(id => cityMovieIds.includes(id));
        } else {
          filteredMovieIds = cityMovieIds;
        }
      }

      // Filter by genre
      if (filterObj.genre) {
        const { data: movieGenres } = await supabase
          .from('movie_genre_mapping')
          .select('movie_id')
          .eq('genre_id', filterObj.genre);
        const genreMovieIds = movieGenres ? movieGenres.map(m => m.movie_id) : [];
        if (filteredMovieIds) {
          filteredMovieIds = filteredMovieIds.filter(id => genreMovieIds.includes(id));
        } else {
          filteredMovieIds = genreMovieIds;
        }
      }

      // Filter by movie id
      if (filterObj.movie) {
        if (filteredMovieIds) {
          filteredMovieIds = filteredMovieIds.filter(id => id === filterObj.movie);
        } else {
          filteredMovieIds = [filterObj.movie];
        }
      }

      // Filter by releaseDate (ถ้าไม่มี city)
      if (filterObj.releaseDate && !filterObj.city) {
        query = query.eq('release_date', filterObj.releaseDate);
      }

      // Filter by type (now-showing, coming-soon)
      if (type === 'now-showing') {
        query = query.lte('release_date', today);
      } else if (type === 'coming-soon') {
        query = query.gt('release_date', today);
      }

      // Apply filteredMovieIds
      if (filteredMovieIds) {
        query = query.in('movie_id', filteredMovieIds);
      }

      const { data, error } = await query.order('release_date', { ascending: true });
      if (error) throw error;

      // --- ดึง genres และ languages ของหนังแต่ละเรื่อง ---
      const movieIds = data.map(m => m.movie_id);
      // ดึง genres (แก้ไขให้ join กับ movie_genres)
      let genresMap = {};
      if (movieIds.length > 0) {
        const { data: genresData } = await supabase
          .from('movie_genre_mapping')
          .select('movie_id, movie_genres:genre_id (name)')
          .in('movie_id', movieIds);
        genresData?.forEach(item => {
          if (!genresMap[item.movie_id]) genresMap[item.movie_id] = [];
          if (item.movie_genres && item.movie_genres.name) {
            genresMap[item.movie_id].push(item.movie_genres.name);
          }
        });
      }
      // ดึง languages (เหมือนเดิม)
      let languagesMap = {};
      if (movieIds.length > 0) {
        const { data: langsData } = await supabase
          .from('movie_languages')
          .select('movie_id, language_type, languages (code)')
          .in('movie_id', movieIds);
        langsData?.forEach(item => {
          if (!languagesMap[item.movie_id]) languagesMap[item.movie_id] = [];
          languagesMap[item.movie_id].push({ type: item.language_type, code: item.languages.code });
        });
      }
      // รวม genres/languages เข้าแต่ละ movie
      const moviesWithDetails = data.map(movie => ({
        ...movie,
        genres: genresMap[movie.movie_id] || [],
        languages: languagesMap[movie.movie_id] || []
      }));
      res.status(200).json(moviesWithDetails);
      return;
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}