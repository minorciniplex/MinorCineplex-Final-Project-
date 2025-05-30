export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);
    
    // Create an anonymous session for viewing seats
    const { data: { session }, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('Error creating anonymous session:', error);
      return res.status(500).json({ 
        error: error.message,
        access_token: null, 
        refresh_token: null 
      });
    }

    return res.status(200).json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      access_token: null,
      refresh_token: null  
    });
  }
}