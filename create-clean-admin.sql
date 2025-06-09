-- เพิ่ม Admin User สำหรับ Minor Cineplex
-- Email: admin@minorcineplex.com
-- Password: admin123

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
    '$2b$12$S1r0REApa.UMpb8WCkuxXe.H7EJsy9jhohEgf/2lj18kQTNWrA8Ee',
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

-- ตรวจสอบผลลัพธ์
SELECT 
    email, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at
FROM admin_users 
WHERE email = 'admin@minorcineplex.com'; 