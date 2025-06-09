import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  try {
    const email = 'admin@minorcineplex.com';
    const password = 'admin123';
    
    // สร้าง password hash
    const passwordHash = await bcrypt.hash(password, 12);
    
    // ลบ admin เก่า (ถ้ามี)
    await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('email', email);
    
    // สร้าง admin ใหม่
    const { data: newAdmin, error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: email,
        password_hash: passwordHash,
        role: 'super_admin',
        permissions: ['*'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({
        success: false,
        error: 'Insert failed: ' + insertError.message,
        details: insertError
      });
    }

    // ทดสอบ password ทันที
    const passwordTest = await bcrypt.compare(password, passwordHash);

    // ทดสอบ query ใหม่
    const { data: testQuery, error: queryError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    res.json({
      success: true,
      message: 'Admin user created successfully!',
      newAdmin: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        is_active: newAdmin.is_active
      },
      passwordHash: passwordHash,
      passwordTest: passwordTest,
      queryTest: {
        success: !queryError,
        error: queryError?.message,
        data: testQuery ? 'Admin found' : 'Admin not found'
      },
      credentials: {
        email: email,
        password: password
      },
      nextStep: 'Try login at /admin/login'
    });

  } catch (error) {
    console.error('Fix admin user error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 