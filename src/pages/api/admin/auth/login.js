import { createClient } from '@supabase/supabase-js';
import { generateAdminToken, comparePassword } from '@/utils/adminAuth';

// ใช้ Service Role สำหรับ Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ดึงข้อมูล admin ด้วย Service Role
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      console.error('Admin query error:', error);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ตรวจสอบ password
    const validPassword = await comparePassword(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // สร้าง JWT token
    const token = generateAdminToken(admin);

    // อัพเดท last_login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // ส่งกลับข้อมูล (ไม่รวม password_hash)
    const { password_hash, ...adminData } = admin;

    res.json({
      success: true,
      token,
      admin: adminData
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 