# ระบบแจ้งเตือน Minor Cineplex

## ภาพรวม
ระบบแจ้งเตือนสำหรับการยกเลิกการจองที่ครอบคลุม:
- 📧 Email confirmation
- 📱 SMS notification  
- 🔔 Push notification
- 💬 In-app notification

## การตั้งค่า Environment Variables

### 1. Email Service (Gmail)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_NOTIFICATIONS_ENABLED=true
```

**วิธีการตั้งค่า Gmail:**
1. ไปที่ Google Account Settings
2. เปิด 2-Step Verification
3. สร้าง App Password สำหรับแอป
4. ใช้ App Password ในการตั้งค่า

### 2. SMS Service (Twilio)
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
SMS_NOTIFICATIONS_ENABLED=true
```

**วิธีการตั้งค่า Twilio:**
1. สมัครบัญชี Twilio
2. ซื้อหมายเลขโทรศัพท์
3. คัดลอก Account SID และ Auth Token
4. ตั้งค่าในไฟล์ .env.local

### 3. Push Notifications (Web Push)
```env
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
PUSH_NOTIFICATIONS_ENABLED=true
```

**วิธีสร้าง VAPID Keys:**
```javascript
// ใช้ในโปรเจกต์หรือรันแยก
import webpush from 'web-push';
const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);
```

### 4. Firebase Cloud Messaging (ทางเลือก)
```env
FCM_SERVER_KEY=your-fcm-server-key
```

## โครงสร้างไฟล์

```
src/services/
├── emailService.js          # ส่ง email
├── smsService.js           # ส่ง SMS
├── pushNotificationService.js # ส่ง push notification
└── notificationService.js   # รวมทุกบริการ
```

## API Endpoints

### การยกเลิกการจองพร้อมแจ้งเตือน
```
POST /api/booking/cancel-with-notifications
{
  "bookingId": "12345",
  "cancellationReason": "I had changed my mind"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully. Notifications are being sent.",
  "data": {
    "bookingId": "12345",
    "refundAmount": 500,
    "refundPercentage": 100,
    "notifications": {
      "status": "sending",
      "message": "Email, SMS, and push notifications are being sent"
    }
  }
}
```

## การใช้งานใน Frontend

### การเรียก API
```javascript
const cancelBooking = async (bookingId, reason) => {
  try {
    const response = await axios.post('/api/booking/cancel-with-notifications', {
      bookingId,
      cancellationReason: reason
    });
    
    console.log('Cancellation successful:', response.data);
    // แสดงข้อความสำเร็จ
    alert('การยกเลิกสำเร็จ! คุณจะได้รับการแจ้งเตือนทาง Email และ SMS');
  } catch (error) {
    console.error('Cancellation failed:', error);
  }
};
```

## Templates การแจ้งเตือน

### Email Template
- ใช้ HTML สวยงามพร้อม CSS inline
- รวมรายละเอียดการจองและการคืนเงิน
- มีข้อมูลติดต่อและลิงก์ไปยังเว็บไซต์

### SMS Template
- ข้อความสั้นและกระชับ
- รวมข้อมูลสำคัญ: หนัง, จำนวนเงินคืน, เปอร์เซ็นต์
- มีลิงก์ไปยังรายละเอียดเพิ่มเติม

### Push Notification
- แสดงไอคอนและรูปภาพ
- มีปุ่มดำเนินการ (ดูรายละเอียด, ปิด)
- รองรับการสั่นและเสียง

## การจัดการ Database

### ตาราง user_notification_preferences
```sql
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  booking_reminders BOOLEAN DEFAULT true,
  cancellation_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## การทดสอบ

### Test Email (ใช้ Gmail SMTP)
```bash
# ทดสอบส่ง email
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test SMS (ใช้ Twilio)
```bash
# ทดสอบส่ง SMS
curl -X POST http://localhost:3000/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "0812345678"}'
```

### Test Push Notification
```bash
# ทดสอบส่ง push notification
curl -X POST http://localhost:3000/api/test/push \
  -H "Content-Type: application/json" \
  -d '{"subscription": {...}}'
```

## Troubleshooting

### Email ส่งไม่ได้
1. ตรวจสอบ Gmail App Password
2. ตรวจสอบการเปิด 2-Step Verification
3. ดู log ใน console สำหรับ error message

### SMS ส่งไม่ได้  
1. ตรวจสอบ Twilio credentials
2. ตรวจสอบ balance ใน Twilio account
3. ตรวจสอบรูปแบบเบอร์โทรศัพท์ (+66xxxxxxxxx)

### Push Notification ไม่ทำงาน
1. ตรวจสอบ VAPID keys
2. ตรวจสอบ browser permissions
3. ตรวจสอบ service worker registration

## ฟีเจอร์เพิ่มเติม

### LINE Notify Integration
```javascript
// ส่งการแจ้งเตือนผ่าน LINE
await sendLineNotify(lineToken, message);
```

### In-App Notifications
```javascript
// แสดงการแจ้งเตือนในแอป
await sendInAppNotification(userId, notificationData);
```

### Notification History
- บันทึกประวัติการส่งการแจ้งเตือน
- แสดงสถานะการส่ง (สำเร็จ/ล้มเหลว)
- รายงานการแจ้งเตือน

## Performance Tips

1. **ส่งการแจ้งเตือนแบบ Asynchronous** - ไม่ให้ blocking การตอบกลับ API
2. **Queue System** - ใช้ Redis หรือ message queue สำหรับการส่งจำนวนมาก
3. **Retry Logic** - ลองส่งใหม่เมื่อล้มเหลว
4. **Rate Limiting** - จำกัดจำนวนการส่งต่อช่วงเวลา 