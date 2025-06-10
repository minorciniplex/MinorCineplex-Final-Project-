import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  try {
    const email = 'admin@minorcineplex.com';
    const password = 'admin123';
    
    // ดึงข้อมูล admin
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return res.json({
        success: false,
        error: 'Admin not found',
        details: error?.message
      });
    }

    // ตรวจสอบ password
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!validPassword) {
      return res.json({
        success: false,
        error: 'Invalid password',
        passwordHash: admin.password_hash
      });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role,
        permissions: admin.permissions 
      },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '24h' }
    );

    // อัพเดท last_login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // ส่งกลับข้อมูล
    const { password_hash, ...adminData } = admin;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      admin: adminData,
      redirectTo: '/admin/dashboard'
    });

  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: error.stack 
    });
  }
} 