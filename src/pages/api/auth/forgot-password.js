import {createSupabaseServerClient} from '@/utils/supabaseCookie';

const handler = async (req, res) => {
  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // ใช้ environment variable หรือ req.headers เพื่อหา base URL
      const baseUrl = process.env.NEXTAUTH_URL || 
                      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                      `http://${req.headers.host}` ||
                      'http://localhost:3000';

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}`,
      });


      if (error) {
        console.error('Error sending reset password email:', error);
        return res.status(500).json({ error: 'Error sending reset password email' });
      }

      return res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
      console.error('Error in POST request:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export default handler;
