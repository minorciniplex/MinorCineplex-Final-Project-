import nodemailer from 'nodemailer';

// Email configuration check
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
let emailConfigured = false;

// Check if email service is properly configured
if (EMAIL_USER && EMAIL_PASSWORD && 
    EMAIL_USER.includes('@') && EMAIL_PASSWORD.length > 5) {
  emailConfigured = true;
} else {
  emailConfigured = false;
}

// Email transporter configuration
const createTransporter = () => {
  if (!emailConfigured) {
    throw new Error('Email service not configured');
  }
  
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
};

// Email templates
const getCancellationEmailTemplate = (bookingData) => {
  const {
    userName,
    movieTitle,
    cinemaName,
    showtimeDate,
    showtimeTime,
    originalAmount,
    refundAmount,
    refundPercentage,
    cancellationReason,
    cancellationDate,
    bookingId
  } = bookingData;

  return {
    subject: `การยกเลิกการจองของคุณสำเร็จแล้ว - Booking #${bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .refund-info { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .amount { font-size: 18px; font-weight: bold; color: #4caf50; }
          .original-amount { text-decoration: line-through; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Minor Cineplex</h1>
            <h2>การยกเลิกการจองเสร็จสิ้น</h2>
          </div>
          
          <div class="content">
            <p>สวัสดี คุณ${userName},</p>
            <p>การยกเลิกการจองของคุณได้เสร็จสิ้นแล้ว เราได้ดำเนินการคืนเงินตามเงื่อนไขของเรา</p>
            
            <div class="booking-details">
              <h3>📝 รายละเอียดการจอง</h3>
              <p><strong>Booking ID:</strong> #${bookingId}</p>
              <p><strong>หนัง:</strong> ${movieTitle}</p>
              <p><strong>โรงภาพยนตร์:</strong> ${cinemaName}</p>
              <p><strong>วันและเวลาที่จอง:</strong> ${showtimeDate} เวลา ${showtimeTime}</p>
              <p><strong>เหตุผลในการยกเลิก:</strong> ${cancellationReason}</p>
              <p><strong>วันที่ยกเลิก:</strong> ${new Date(cancellationDate).toLocaleDateString('th-TH')}</p>
            </div>
            
            <div class="refund-info">
              <h3>💰 รายละเอียดการคืนเงิน</h3>
              <p><strong>ยอดเงินเดิม:</strong> <span class="original-amount">THB ${originalAmount}</span></p>
              <p><strong>เปอร์เซ็นต์การคืนเงิน:</strong> ${refundPercentage}%</p>
              <p><strong>ยอดเงินที่คืน:</strong> <span class="amount">THB ${refundAmount}</span></p>
              <p style="margin-top: 15px; font-size: 14px; color: #666;">
                💡 เงินจะได้รับคืนผ่านช่องทางการชำระเงินเดิมภายใน 3-7 วันทำการ
              </p>
            </div>
            
            <p>หากคุณมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อเราที่:</p>
            <p>📞 โทร: 02-123-4567<br>
               📧 อีเมล: support@minorcineplex.com<br>
               🕒 เวลาทำการ: จันทร์-อาทิตย์ 9:00-22:00</p>
               
            <p style="margin-top: 30px;">ขอบคุณที่ใช้บริการ Minor Cineplex</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 Minor Cineplex. All rights reserved.</p>
            <p>หากคุณไม่ต้องการรับอีเมลจากเรา คลิก <a href="#">ยกเลิกการรับอีเมล</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
การยกเลิกการจองของคุณสำเร็จแล้ว - Minor Cineplex

สวัสดี คุณ${userName},

การยกเลิกการจองของคุณได้เสร็จสิ้นแล้ว

รายละเอียดการจอง:
- Booking ID: #${bookingId}
- หนัง: ${movieTitle}
- โรงภาพยนตร์: ${cinemaName}
- วันและเวลา: ${showtimeDate} เวลา ${showtimeTime}
- เหตุผลในการยกเลิก: ${cancellationReason}

รายละเอียดการคืนเงิน:
- ยอดเงินเดิม: THB ${originalAmount}
- เปอร์เซ็นต์การคืนเงิน: ${refundPercentage}%
- ยอดเงินที่คืน: THB ${refundAmount}

เงินจะได้รับคืนผ่านช่องทางการชำระเงินเดิมภายใน 3-7 วันทำการ

ติดต่อเรา: 02-123-4567
อีเมล: support@minorcineplex.com

ขอบคุณที่ใช้บริการ Minor Cineplex
    `
  };
};

// Main function to send cancellation email
export const sendCancellationEmail = async (userEmail, bookingData) => {
  try {
    // Check if email service is configured
    if (!emailConfigured) {
      return {
        success: false,
        error: 'Email service not configured',
        message: 'Email service not available - Gmail credentials missing'
      };
    }

    const transporter = createTransporter();
    const emailTemplate = getCancellationEmailTemplate(bookingData);
    
    const mailOptions = {
      from: {
        name: 'Minor Cineplex',
        address: EMAIL_USER
      },
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending cancellation email');
    return {
      success: false,
      error: 'Failed to send email',
      message: 'Failed to send email'
    };
  }
};

// Function to send booking confirmation email (for future use)
export const sendBookingConfirmationEmail = async (userEmail, bookingData) => {
  // Implementation for booking confirmation
  // This can be used when creating new bookings
  return {
    success: false,
    message: 'Not implemented yet'
  };
};

// Function to send refund confirmation email
export const sendRefundConfirmationEmail = async (userEmail, refundData) => {
  try {
    if (!emailConfigured) {
      return {
        success: false,
        error: 'Email service not configured',
        message: 'Email service not available'
      };
    }

    const {
      userName,
      bookingId,
      refundId,
      refundAmount,
      estimatedDays,
      refundMethod
    } = refundData;

    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Minor Cineplex',
        address: EMAIL_USER
      },
      to: userEmail,
      subject: `การคืนเงินเสร็จสิ้น - Booking #${bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .refund-success { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
            .refund-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .amount { font-size: 24px; font-weight: bold; color: #4caf50; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>🎬 Minor Cineplex</h1>
              <h2>การคืนเงินเสร็จสิ้น</h2>
            </div>
            
            <div class="content">
              <div class="refund-success">
                <h3>🎉 การคืนเงินสำเร็จแล้ว!</h3>
                <p>สวัสดี คุณ${userName},</p>
                <p>เราได้ดำเนินการคืนเงินสำหรับการยกเลิกการจองของคุณเรียบร้อยแล้ว</p>
              </div>
              
              <div class="refund-details">
                <h3>💰 รายละเอียดการคืนเงิน</h3>
                <p><strong>Booking ID:</strong> #${bookingId}</p>
                <p><strong>Refund ID:</strong> ${refundId}</p>
                <p><strong>จำนวนเงินที่คืน:</strong> <span class="amount">THB ${refundAmount}</span></p>
                <p><strong>วิธีการคืนเงิน:</strong> ${refundMethod}</p>
                <p><strong>เวลาที่ดำเนินการ:</strong> ${new Date().toLocaleString('th-TH')}</p>
                <p><strong>ระยะเวลาที่คาดว่าจะได้รับเงิน:</strong> ${estimatedDays}</p>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h4>📌 ข้อมูลสำคัญ</h4>
                <ul>
                  <li>เงินจะถูกโอนกลับไปยังบัญชี/บัตรที่ใช้ชำระเงิน</li>
                  <li>กรุณาตรวจสอบบัญชีของคุณภายใน ${estimatedDays}</li>
                  <li>หากไม่ได้รับเงินภายในเวลาที่กำหนด กรุณาติดต่อเรา</li>
                </ul>
              </div>
              
              <p>หากคุณมีคำถามเกี่ยวกับการคืนเงิน กรุณาติดต่อเราที่:</p>
              <p>📞 โทร: 02-123-4567<br>
                 📧 อีเมล: support@minorcineplex.com<br>
                 🕒 เวลาทำการ: จันทร์-อาทิตย์ 9:00-22:00</p>
                 
              <p style="margin-top: 30px;">ขอบคุณที่ใช้บริการ Minor Cineplex</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 Minor Cineplex. All rights reserved.</p>
              <p>Refund ID: ${refundId} | Transaction Date: ${new Date().toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
การคืนเงินเสร็จสิ้น - Minor Cineplex

สวัสดี คุณ${userName},

การคืนเงินสำหรับการยกเลิกการจองของคุณเสร็จสิ้นแล้ว

รายละเอียดการคืนเงิน:
- Booking ID: #${bookingId}
- Refund ID: ${refundId}
- จำนวนเงินที่คืน: THB ${refundAmount}
- วิธีการคืนเงิน: ${refundMethod}
- ระยะเวลาที่คาดว่าจะได้รับเงิน: ${estimatedDays}

เงินจะถูกโอนกลับไปยังบัญชี/บัตรที่ใช้ชำระเงิน
กรุณาตรวจสอบบัญชีของคุณภายใน ${estimatedDays}

ติดต่อเรา: 02-123-4567
อีเมล: support@minorcineplex.com

ขอบคุณที่ใช้บริการ Minor Cineplex
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Refund confirmation email sent successfully'
    };
  } catch (error) {
    console.error('Error sending refund confirmation email');
    return {
      success: false,
      error: 'Failed to send email',
      message: 'Failed to send refund confirmation email'
    };
  }
};

// Function to check if email service is available
export const isEmailServiceAvailable = () => {
  return emailConfigured;
};

// Function to get email service status
export const getEmailServiceStatus = () => {
  return {
    configured: emailConfigured,
    hasEmailUser: !!EMAIL_USER,
    hasEmailPassword: !!EMAIL_PASSWORD,
    validEmailUser: EMAIL_USER?.includes('@') || false
  };
};

export default {
  sendCancellationEmail,
  sendBookingConfirmationEmail,
  isEmailServiceAvailable,
  getEmailServiceStatus
}; 