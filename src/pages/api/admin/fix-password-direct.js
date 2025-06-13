import { supabase } from '@/utils/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    const email = 'admin@minorcineplex.com';
    const plainPassword = 'admin123';
    
    // สร้าง hash ใหม่ด้วย saltRounds = 12
    const newHash = await bcrypt.hash(plainPassword, 12);
    
    // ทดสอบ hash ที่สร้างขึ้น
    const testHash = await bcrypt.compare(plainPassword, newHash);
    
    // อัพเดทฐานข้อมูล
    const { data, error } = await supabase
      .from('admin_users')
      .update({ 
        password_hash: newHash,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password hash updated successfully!',
      email: email,
      newHash: newHash,
      hashTest: testHash,
      updatedRecord: data[0] ? 'Record updated' : 'No record found',
      sqlUsed: `UPDATE admin_users SET password_hash = '${newHash}', updated_at = NOW() WHERE email = '${email}';`
    });

  } catch (error) {
    console.error('Fix password error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 