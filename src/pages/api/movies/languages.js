import { supabase } from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { movieIds } = req.query;
      
      if (!movieIds) {
        return res.status(400).json({ error: 'movieIds parameter is required' });
      }

      let ids;
      try {
        ids = JSON.parse(movieIds);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid movieIds format' });
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'movieIds must be a non-empty array' });
      }

      const { data, error } = await supabase
        .from('movie_languages')
        .select(`
          movie_id,
          language_id,
          language_type,
          languages (
            code
          )
        `)
        .in('movie_id', ids);

      if (error) {
        console.error('Supabase Error:', error);
        return res.status(500).json({ error: 'Database error occurred' });
      }

      const formattedData = data.map(item => ({
        movie_id: item.movie_id,
        language_id: item.language_id,
        language_type: item.language_type,
        code: item.languages.code
      }));

      res.status(200).json(formattedData);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 