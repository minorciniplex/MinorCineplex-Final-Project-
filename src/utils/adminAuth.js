import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const verifyAdminToken = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (error || !admin) return null;

    return admin;
  } catch (error) {
    console.error('Admin token verification failed:', error);
    return null;
  }
};

export const generateAdminToken = (admin) => {
  return jwt.sign(
    { 
      id: admin.id, 
      email: admin.email, 
      role: admin.role,
      permissions: admin.permissions 
    },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const checkPermission = (adminPermissions, requiredPermission) => {
  if (!Array.isArray(adminPermissions)) return false;
  return adminPermissions.includes(requiredPermission) || adminPermissions.includes('*');
}; 