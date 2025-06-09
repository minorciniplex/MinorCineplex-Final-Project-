import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // แสดงข้อมูลสำหรับเพิ่ม admin user manual
    const hashedPassword = await bcrypt.hash('admin123', 12);

    res.json({
      success: true,
      message: 'คัดลอก SQL นี้ไปรันใน Supabase SQL Editor',
      sql: `
INSERT INTO admin_users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    permissions,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@minorcineplex.com',
    '${hashedPassword}',
    'Admin',
    'User',
    'super_admin',
    ARRAY[
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
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();
      `,
      credentials: {
        email: 'admin@minorcineplex.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 