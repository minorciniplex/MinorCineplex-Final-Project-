-- สร้าง Admin User ตัวแรก
-- รหัสผ่าน "admin123" จะถูก hash แล้ว

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
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOOG1hvVOUhqJ/WoChzw/C7Y6CyNGVgj2', -- admin123
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

-- ตรวจสอบว่าเพิ่มแล้ว
SELECT email, first_name, last_name, role, is_active 
FROM admin_users 
WHERE email = 'admin@minorcineplex.com'; 