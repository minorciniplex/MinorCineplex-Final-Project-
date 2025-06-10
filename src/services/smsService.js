import twilio from 'twilio';

// Twilio configuration - only create client if credentials are available
let twilioClient = null;
let twilioConfigured = false;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Check if Twilio is properly configured
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && 
    TWILIO_ACCOUNT_SID.startsWith('AC') && TWILIO_AUTH_TOKEN.length > 10) {
  try {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    twilioConfigured = true;
    console.log('Twilio client configured successfully');
  } catch (error) {
    console.error('Failed to configure Twilio client:', error);
    twilioConfigured = false;
  }
} else {
  console.warn('Twilio not configured - SMS functionality will be disabled');
  twilioConfigured = false;
}

// SMS message templates
const getCancellationSMSMessage = (bookingData) => {
  const {
    userName,
    movieTitle,
    bookingId,
    refundAmount,
    refundPercentage
  } = bookingData;

  return `🎬 Minor Cineplex
การยกเลิกสำเร็จ!

สวัสดี คุณ${userName}
Booking #${bookingId}
หนัง: ${movieTitle}

💰 คืนเงิน ${refundPercentage}%
จำนวน THB ${refundAmount}

เงินคืนภายใน 3-7 วันทำการ
ดูรายละเอียด: minorcineplex.com/dashboard

ขอบคุณครับ! 🙏`;
};

const getBookingConfirmationSMSMessage = (bookingData) => {
  const {
    userName,
    movieTitle,
    cinemaName,
    showtimeDate,
    showtimeTime,
    bookingId,
    totalAmount
  } = bookingData;

  return `🎬 Minor Cineplex
จองสำเร็จแล้ว!

คุณ${userName}
Booking #${bookingId}
หนัง: ${movieTitle}
โรง: ${cinemaName}
วันที่: ${showtimeDate}
เวลา: ${showtimeTime}

💰 THB ${totalAmount}

แสดง QR Code ที่หน้าจอ
ดูรายละเอียด: minorcineplex.com/dashboard

ขอบคุณครับ! 🎉`;
};

// Main function to send cancellation SMS
export const sendCancellationSMS = async (phoneNumber, bookingData) => {
  try {
    // Check if Twilio is configured
    if (!twilioConfigured || !twilioClient) {
      console.warn('Twilio not configured - skipping SMS send');
      return {
        success: false,
        error: 'Twilio not configured',
        message: 'SMS service not available - Twilio credentials missing'
      };
    }

    // Format phone number (ensure it starts with country code)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const message = getCancellationSMSMessage(bookingData);
    
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('Cancellation SMS sent successfully:', result.sid);
    
    return {
      success: true,
      messageId: result.sid,
      message: 'SMS sent successfully'
    };
  } catch (error) {
    console.error('Error sending cancellation SMS:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send SMS'
    };
  }
};

// Function to send booking confirmation SMS
export const sendBookingConfirmationSMS = async (phoneNumber, bookingData) => {
  try {
    // Check if Twilio is configured
    if (!twilioConfigured || !twilioClient) {
      console.warn('Twilio not configured - skipping SMS send');
      return {
        success: false,
        error: 'Twilio not configured',
        message: 'SMS service not available - Twilio credentials missing'
      };
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const message = getBookingConfirmationSMSMessage(bookingData);
    
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('Booking confirmation SMS sent successfully:', result.sid);
    
    return {
      success: true,
      messageId: result.sid,
      message: 'SMS sent successfully'
    };
  } catch (error) {
    console.error('Error sending booking confirmation SMS:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send SMS'
    };
  }
};

// Utility function to format phone number
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If starts with 0 (Thai format), replace with +66
  if (cleaned.startsWith('0')) {
    cleaned = '+66' + cleaned.substring(1);
  }
  // If doesn't start with +, assume it's Thai and add +66
  else if (!cleaned.startsWith('+')) {
    cleaned = '+66' + cleaned;
  }
  
  return cleaned;
};

// Function to validate phone number
export const validatePhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Thai phone number validation (10 digits starting with 0, or 9 digits for mobile)
  const thaiMobileRegex = /^0[6-9]\d{8}$/;
  const thaiLandlineRegex = /^0[2-7]\d{7,8}$/;
  
  return thaiMobileRegex.test(cleaned) || thaiLandlineRegex.test(cleaned);
};

// Alternative SMS service using LINE Notify (popular in Thailand)
export const sendLineNotify = async (lineToken, message) => {
  try {
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${lineToken}`
      },
      body: new URLSearchParams({
        message: message
      })
    });

    if (response.ok) {
      console.log('LINE notification sent successfully');
      return {
        success: true,
        message: 'LINE notification sent successfully'
      };
    } else {
      throw new Error('Failed to send LINE notification');
    }
  } catch (error) {
    console.error('Error sending LINE notification:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send LINE notification'
    };
  }
};

// Function to check if SMS service is available
export const isSMSServiceAvailable = () => {
  return twilioConfigured;
};

// Function to get SMS service status
export const getSMSServiceStatus = () => {
  return {
    configured: twilioConfigured,
    hasAccountSid: !!TWILIO_ACCOUNT_SID,
    hasAuthToken: !!TWILIO_AUTH_TOKEN,
    hasPhoneNumber: !!TWILIO_PHONE_NUMBER,
    validAccountSid: TWILIO_ACCOUNT_SID?.startsWith('AC') || false
  };
};

export default {
  sendCancellationSMS,
  sendBookingConfirmationSMS,
  validatePhoneNumber,
  sendLineNotify,
  isSMSServiceAvailable,
  getSMSServiceStatus
}; 