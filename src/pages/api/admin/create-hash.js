import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    // Hash password "admin123" ด้วย saltRounds เดียวกับที่ใช้ในระบบ
    const password = 'admin123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ทดสอบ compare
    const isValid = await bcrypt.compare(password, hashedPassword);

    res.json({
      success: true,
      password: password,
      hash: hashedPassword,
      isValid: isValid,
      sql: `
UPDATE admin_users 
SET password_hash = '${hashedPassword}', updated_at = NOW()
WHERE email = 'admin@minorcineplex.com';
      `
    });
  } catch (error) {
    console.error('Hash generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 