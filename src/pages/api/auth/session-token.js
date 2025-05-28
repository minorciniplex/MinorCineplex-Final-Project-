import { createSupabaseServerClient } from '@/utils/supabaseCookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return res.status(401).json({ 
        error: 'No valid session',
        access_token: null,
        refresh_token: null
      });
    }

    // Return tokens for client-side real-time setup
    return res.status(200).json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at
    });
  } catch (error) {
    console.error('Error getting session tokens:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      access_token: null,
      refresh_token: null
    });
  }
}