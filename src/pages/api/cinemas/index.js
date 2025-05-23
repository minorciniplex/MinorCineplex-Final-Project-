import { supabase } from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { province } = req.query;
      let query = supabase.from('cinemas').select('*');

      if (province) {
        query = query.eq('province', province);
      }

      const { data, error } = await query;

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}