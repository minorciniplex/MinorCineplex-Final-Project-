import { createClient } from '@supabase/supabase-js';

// ใช้ service role key เพื่อข้าม RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Hash password "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // เช็คว่ามี admin user แล้วหรือยัง
    const { data: existingAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('email')
      .eq('email', 'admin@minorcineplex.com')
      .single();

    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin user already exists',
        credentials: {
          email: 'admin@minorcineplex.com',
          password: 'admin123'
        }
      });
    }

    // สร้าง admin user ใหม่
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .insert([
        {
          email: 'admin@minorcineplex.com',
          password_hash: hashedPassword,
          first_name: 'Admin',
          last_name: 'User',
          role: 'super_admin',
          permissions: [
            'dashboard.read',
            'movies.read',
            'movies.write',
            'showtimes.read', 
            'showtimes.write',
            'bookings.read',
            'bookings.write',
            'analytics.read',
            'users.read',
            'users.write',
            'admin.read',
            'admin.write'
          ],
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return res.status(500).json({ error: 'Failed to create admin user', details: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: 'admin@minorcineplex.com',
        password: 'admin123'
      },
      admin: {
        id: admin.id,
        email: admin.email,
        name: `${admin.first_name} ${admin.last_name}`,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 