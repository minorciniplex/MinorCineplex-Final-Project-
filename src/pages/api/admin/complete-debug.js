import { supabase } from '@/utils/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    const email = 'admin@minorcineplex.com';
    const password = 'admin123';

    // 1. เช็ค Environment Variables
    const jwtSecret = process.env.ADMIN_JWT_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. เช็คการเชื่อมต่อฐานข้อมูล
    const { data: testConnection, error: connectionError } = await supabase
      .from('admin_users')
      .select('count(*)')
      .limit(1);

    // 3. ดึงข้อมูล admin
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // 4. สร้าง hash ใหม่และทดสอบ
    const newHash = await bcrypt.hash(password, 12);
    const newHashTest = await bcrypt.compare(password, newHash);
    
    // 5. ทดสอบกับ hash เก่า (ถ้ามี)
    let oldHashTest = false;
    if (admin && admin.password_hash) {
      oldHashTest = await bcrypt.compare(password, admin.password_hash);
    }

    // 6. ทดสอบ JWT
    let jwtTest = false;
    let jwtError = null;
    try {
      if (admin && jwtSecret) {
        const token = jwt.sign(
          { id: admin.id, email: admin.email, role: admin.role },
          jwtSecret,
          { expiresIn: '24h' }
        );
        const decoded = jwt.verify(token, jwtSecret);
        jwtTest = !!decoded;
      }
    } catch (error) {
      jwtError = error.message;
    }

    // 7. อัพเดท password hash ใหม่
    let updateResult = null;
    if (admin) {
      const { data: updated, error: updateError } = await supabase
        .from('admin_users')
        .update({ 
          password_hash: newHash,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      updateResult = {
        success: !updateError,
        error: updateError?.message,
        updatedData: updated?.[0]
      };
    }

    // ผลลัพธ์สมบูรณ์
    res.json({
      step1_environment: {
        hasJwtSecret: !!jwtSecret,
        jwtSecretLength: jwtSecret?.length || 0,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey
      },
      step2_database: {
        connectionSuccess: !connectionError,
        connectionError: connectionError?.message,
        testQuery: testConnection
      },
      step3_admin_user: {
        found: !!admin,
        error: adminError?.message,
        email: admin?.email,
        isActive: admin?.is_active,
        role: admin?.role,
        permissions: admin?.permissions,
        oldPasswordHash: admin?.password_hash
      },
      step4_password_test: {
        newHash: newHash,
        newHashValid: newHashTest,
        oldHashValid: oldHashTest,
        hashesMatch: admin?.password_hash === newHash
      },
      step5_jwt_test: {
        jwtWorks: jwtTest,
        jwtError: jwtError
      },
      step6_update_result: updateResult,
      credentials: {
        email: email,
        password: password
      },
      finalStatus: {
        readyToLogin: updateResult?.success && jwtTest && !!admin,
        issues: []
      }
    });

  } catch (error) {
    console.error('Complete debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 