const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      // Get email service status
      const emailStatus = {
        configured: false,
        hasEmailUser: false,
        hasEmailPassword: false,
        validEmailUser: false
      };

      const EMAIL_USER = process.env.EMAIL_USER;
      const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

      if (EMAIL_USER && EMAIL_PASSWORD) {
        emailStatus.hasEmailUser = true;
        emailStatus.hasEmailPassword = true;
        emailStatus.validEmailUser = EMAIL_USER.includes('@');
        emailStatus.configured = emailStatus.validEmailUser && EMAIL_PASSWORD.length > 5;
      }

      // Get SMS service status
      const smsStatus = {
        configured: false,
        hasAccountSid: false,
        hasAuthToken: false,
        hasPhoneNumber: false,
        validAccountSid: false
      };

      const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
      const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
      const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
        smsStatus.hasAccountSid = true;
        smsStatus.hasAuthToken = true;
        smsStatus.hasPhoneNumber = true;
        smsStatus.validAccountSid = TWILIO_ACCOUNT_SID.startsWith('AC');
        smsStatus.configured = smsStatus.validAccountSid && 
                               TWILIO_AUTH_TOKEN.length > 10 && 
                               TWILIO_PHONE_NUMBER.startsWith('+');
      }

      return res.status(200).json({
        success: true,
        email: emailStatus,
        sms: smsStatus,
        message: "Service status retrieved successfully"
      });

    } catch (error) {
      console.error("Error getting service status:", error);
      return res.status(500).json({ 
        error: "Failed to get service status",
        details: error.message 
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default handler; 