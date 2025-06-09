import {createSupabaseServerClient} from '@/utils/supabaseCookie';

const handler = async (req, res) => {
  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `http://localhost:3000/auth/reset-password?email=${encodeURIComponent(email)}`,
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
