import { sendCancellationEmail, isEmailServiceAvailable, getEmailServiceStatus } from "@/services/emailService";
import { sendCancellationSMS, validatePhoneNumber, isSMSServiceAvailable, getSMSServiceStatus } from "@/services/smsService";
import { sendCancellationNotifications } from "@/services/notificationService";

const handler = async (req, res) => {
  if (req.method === "GET") {
    // Get service status
    return res.status(200).json({
      email: getEmailServiceStatus(),
      sms: getSMSServiceStatus(),
      message: "Service status retrieved successfully"
    });
  } else if (req.method === "POST") {
    const { type, testData } = req.body;

    try {
      switch (type) {
        case "email":
          return await testEmail(req, res, testData);
        
        case "sms":
          return await testSMS(req, res, testData);
        
        case "all":
          return await testAllNotifications(req, res, testData);
        
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

// Test email notification
const testEmail = async (req, res, testData) => {
  const { email } = testData;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Check if email service is available
  if (!isEmailServiceAvailable()) {
    return res.status(400).json({ 
      error: "Email service not configured",
      message: "Please set EMAIL_USER and EMAIL_PASSWORD environment variables",
      serviceStatus: getEmailServiceStatus()
    });
  }

  const mockBookingData = {
    userName: "คุณทดสอบ",
    movieTitle: "Avatar: The Way of Water",
    cinemaName: "Paragon Cineplex",
    showtimeDate: "15 ธ.ค. 2024",
    showtimeTime: "19:30",
    originalAmount: 320,
    refundAmount: 320,
    refundPercentage: 100,
    cancellationReason: "I had changed my mind",
    cancellationDate: new Date().toISOString(),
    bookingId: "TEST-12345"
  };

  const result = await sendCancellationEmail(email, mockBookingData);
  
  return res.status(200).json({
    success: result.success,
    message: result.success ? "Test email sent successfully" : "Test email failed",
    details: result,
    serviceStatus: getEmailServiceStatus()
  });
};

// Test SMS notification
const testSMS = async (req, res, testData) => {
  const { phone } = testData;
  
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  // Check if SMS service is available
  if (!isSMSServiceAvailable()) {
    return res.status(400).json({ 
      error: "SMS service not configured",
      message: "Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables",
      serviceStatus: getSMSServiceStatus()
    });
  }

  if (!validatePhoneNumber(phone)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  const mockBookingData = {
    userName: "คุณทดสอบ",
    movieTitle: "Avatar: The Way of Water",
    bookingId: "TEST-12345",
    refundAmount: 320,
    refundPercentage: 100
  };

  const result = await sendCancellationSMS(phone, mockBookingData);
  
  return res.status(200).json({
    success: result.success,
    message: result.success ? "Test SMS sent successfully" : "Test SMS failed",
    details: result,
    serviceStatus: getSMSServiceStatus()
  });
};

// Test all notifications
const testAllNotifications = async (req, res, testData) => {
  const { email, phone, name } = testData;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required for comprehensive test" });
  }

  const mockUserData = {
    id: "test-user-123",
    email: email,
    phone: phone || null,
    name: name || "คุณทดสอบ",
    pushSubscriptions: [] // Empty for now
  };

  const mockBookingData = {
    bookingId: "TEST-12345",
    movieTitle: "Avatar: The Way of Water",
    cinemaName: "Paragon Cineplex",
    showtimeDate: "15 ธ.ค. 2024",
    showtimeTime: "19:30",
    originalAmount: 320,
    refundAmount: 320,
    refundPercentage: 100,
    cancellationReason: "I had changed my mind",
    cancellationDate: new Date().toISOString()
  };

  const result = await sendCancellationNotifications(
    mockUserData, 
    mockBookingData, 
    {
      sendEmail: true,
      sendSMS: phone ? true : false,
      sendPush: false, // Skip push for testing
      sendInApp: true
    }
  );
  
  return res.status(200).json({
    success: true,
    message: "Comprehensive notification test completed",
    results: result,
    summary: {
      totalAttempted: result.summary.totalSent + result.summary.totalFailed,
      totalSent: result.summary.totalSent,
      totalFailed: result.summary.totalFailed,
      errors: result.summary.errors
    },
    serviceStatus: {
      email: getEmailServiceStatus(),
      sms: getSMSServiceStatus()
    }
  });
};

export default handler; 