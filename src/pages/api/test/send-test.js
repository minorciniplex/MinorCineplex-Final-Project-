const handler = async (req, res) => {
  if (req.method === "POST") {
    const { type, testData } = req.body;

    try {
      switch (type) {
        case "email":
          return await testEmailDirect(req, res, testData);
        
        case "sms":
          return await testSMSDirect(req, res, testData);
        
        case "all":
          return await testAllDirect(req, res, testData);
        
        default:
          return res.status(400).json({ 
            error: "Invalid test type. Use 'email', 'sms', or 'all'" 
          });
      }
    } catch (error) {
      console.error("Test notification error:", error);
      return res.status(500).json({ 
        error: "Test failed",
        details: error.message 
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

// Direct email test without importing service
const testEmailDirect = async (req, res, testData) => {
  const { email } = testData;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

  if (!EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_USER.includes('@')) {
    return res.status(400).json({ 
      error: "Email service not configured",
      message: "Please set EMAIL_USER and EMAIL_PASSWORD environment variables"
    });
  }

  try {
    // Import nodemailer only when needed
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: '🎬 ทดสอบระบบแจ้งเตือน - Minor Cineplex',
      html: `
        <h2>🎬 ทดสอบระบบแจ้งเตือน</h2>
        <p>สวัสดี!</p>
        <p>นี่คือการทดสอบระบบ Email notification ของ Minor Cineplex</p>
        <p>หากคุณได้รับอีเมลนี้ แสดงว่าระบบทำงานถูกต้อง ✅</p>
        <hr>
        <p style="color: gray; font-size: 12px;">ส่งจากระบบทดสอบ Minor Cineplex</p>
      `,
      text: 'ทดสอบระบบแจ้งเตือน Minor Cineplex - หากได้รับข้อความนี้แสดงว่าระบบทำงานถูกต้อง'
    };

    const result = await transporter.sendMail(mailOptions);
    
    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Email test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to send test email"
    });
  }
};

// Direct SMS test without importing service
const testSMSDirect = async (req, res, testData) => {
  const { phone } = testData;
  
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER ||
      !TWILIO_ACCOUNT_SID.startsWith('AC')) {
    return res.status(400).json({ 
      error: "SMS service not configured",
      message: "Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables"
    });
  }

  try {
    // Import twilio only when needed
    const twilio = require('twilio');
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+66' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+66' + formattedPhone;
    }

    const message = `🎬 Minor Cineplex - ทดสอบระบบ SMS สำเร็จ! ✅ ระบบแจ้งเตือนพร้อมใช้งาน`;

    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    return res.status(200).json({
      success: true,
      message: "Test SMS sent successfully",
      messageId: result.sid
    });

  } catch (error) {
    console.error('SMS test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to send test SMS"
    });
  }
};

// Test both email and SMS
const testAllDirect = async (req, res, testData) => {
  const { email, phone } = testData;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required for comprehensive test" });
  }

  const results = {
    email: { attempted: false },
    sms: { attempted: false },
    summary: { totalSent: 0, totalFailed: 0 }
  };

  // Test email
  if (email) {
    try {
      results.email.attempted = true;
      const emailResult = await testEmailDirect(req, { status: () => ({ json: () => {} }) }, { email });
      results.email = { ...results.email, success: true };
      results.summary.totalSent++;
    } catch (error) {
      results.email = { ...results.email, success: false, error: error.message };
      results.summary.totalFailed++;
    }
  }

  // Test SMS if phone provided
  if (phone) {
    try {
      results.sms.attempted = true;
      const smsResult = await testSMSDirect(req, { status: () => ({ json: () => {} }) }, { phone });
      results.sms = { ...results.sms, success: true };
      results.summary.totalSent++;
    } catch (error) {
      results.sms = { ...results.sms, success: false, error: error.message };
      results.summary.totalFailed++;
    }
  }

  return res.status(200).json({
    success: true,
    message: "Comprehensive test completed",
    results: results
  });
};

export default handler; 