import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '@/utils/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await verifyAdminToken(req);
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // ส่งข้อมูล admin กลับ (ไม่รวม password_hash)
    const { password_hash, ...adminData } = admin;
    
    res.json({
      success: true,
      admin: adminData
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 