import supabase from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { coupon_id } = req.query;
      const { status } = req.body;

      const { data, error } = await supabase
        .from('coupons')
        .update({ status })
        .eq('coupon_id', coupon_id)
        .select();

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}