import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    const password = 'admin123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `UPDATE admin_users 
SET password_hash = '${hashedPassword}', 
    updated_at = NOW()
WHERE email = 'admin@minorcineplex.com';`;

    // ส่งกลับเป็น HTML ง่ายๆ
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Fix Admin Password</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .sql-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .copy-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🔧 แก้ไข Admin Password</h1>
    <p><strong>คัดลอก SQL นี้ไปรันใน Supabase SQL Editor:</strong></p>
    
    <div class="sql-box">
        <pre id="sqlCode">${sql}</pre>
    </div>
    
    <button class="copy-btn" onclick="copyToClipboard()">📋 คัดลอก SQL</button>
    
    <hr style="margin: 30px 0;">
    
    <h3>📝 ขั้นตอน:</h3>
    <ol>
        <li>คัดลอก SQL ด้านบน</li>
        <li>ไปที่ <strong>Supabase Dashboard → SQL Editor</strong></li>
        <li>วาง SQL และกด <strong>Run</strong></li>
        <li>ลองล็อกอินใหม่ที่: <a href="/admin/login" target="_blank">Admin Login</a></li>
    </ol>
    
    <p><strong>ข้อมูลล็อกอิน:</strong></p>
    <ul>
        <li>Email: <code>admin@minorcineplex.com</code></li>
        <li>Password: <code>admin123</code></li>
    </ul>

    <script>
        function copyToClipboard() {
            const sqlText = document.getElementById('sqlCode').textContent;
            navigator.clipboard.writeText(sqlText).then(function() {
                alert('คัดลอก SQL แล้ว! ไปวางใน Supabase SQL Editor');
            });
        }
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Fix password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 