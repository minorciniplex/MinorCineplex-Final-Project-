import { supabase } from '@/utils/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    const email = 'admin@minorcineplex.com';
    const password = 'admin123';

    // เช็คข้อมูลในฐานข้อมูล
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !admin) {
      return res.json({
        step: 'Database Query',
        success: false,
        error: error?.message || 'Admin not found',
        query: `SELECT * FROM admin_users WHERE email = '${email}'`
      });
    }

    // ทดสอบ password compare
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    // สร้าง hash ใหม่เพื่อเปรียบเทียบ
    const newHash = await bcrypt.hash(password, 12);
    const newHashValid = await bcrypt.compare(password, newHash);

    // เช็ค JWT Secret
    const jwtSecret = process.env.ADMIN_JWT_SECRET;

    res.json({
      success: true,
      email: admin.email,
      isActive: admin.is_active,
      role: admin.role,
      passwordCheck: {
        currentHash: admin.password_hash,
        isValidPassword: isValidPassword,
        newHash: newHash,
        newHashValid: newHashValid
      },
      environment: {
        hasJwtSecret: !!jwtSecret,
        jwtSecretLength: jwtSecret?.length || 0
      },
      fixSql: `UPDATE admin_users SET password_hash = '${newHash}', updated_at = NOW() WHERE email = '${email}';`
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
} 