# 💳 ระบบคืนเงินจริง - Minor Cineplex

คู่มือการติดตั้งและใช้งานระบบคืนเงินอัตโนมัติผ่าน Payment Gateway

## 🏗️ ภาพรวมระบบ

ระบบคืนเงินอัตโนมัติที่รองรับ Payment Gateway หลายตัว:
- **Stripe** (แนะนำ - ง่ายที่สุด)
- **Omise** (สำหรับตลาดไทย)
- **PayPal** (สำหรับระดับโลก)

## 🎯 Features

- ✅ **คืนเงินอัตโนมัติ** ผ่าน Payment Gateway API
- ✅ **Partial Refunds** สามารถคืนเงินบางส่วนได้
- ✅ **Status Tracking** ติดตามสถานะการคืนเงินแบบ real-time
- ✅ **Webhook Integration** รับ callback จาก Gateway
- ✅ **Email Notifications** แจ้งเตือนการคืนเงิน
- ✅ **Database Logging** บันทึกทุก transaction
- ✅ **Error Handling** จัดการ error อย่างปลอดภัย

## 🚀 การติดตั้ง

### 1. Stripe Setup (แนะนำ)

#### Step 1: สร้าง Stripe Account
```bash
# ไปที่ https://stripe.com
# สร้างบัญชีและ verify
# ไปที่ Developers > API Keys
```

#### Step 2: Environment Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx  # Test key (prod: sk_live_xxxxx)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
REFUND_ENABLED=true
```

#### Step 3: Webhook Setup
```bash
# ใน Stripe Dashboard:
# Developers > Webhooks > Add endpoint
# URL: https://yourdomain.com/api/webhook/refund-status?provider=stripe
# Events: refund.updated
```

#### Step 4: Install Dependencies
```bash
npm install stripe
```

### 2. Omise Setup (สำหรับไทย)

#### Step 1: สร้าง Omise Account
```bash
# ไปที่ https://omise.co
# สร้างบัญชีและ verify
# ไปที่ Settings > Keys
```

#### Step 2: Environment Variables
```env
# Omise Configuration  
OMISE_SECRET_KEY=skey_test_xxxxx
OMISE_WEBHOOK_SECRET=your_webhook_secret
```

#### Step 3: Install Dependencies
```bash
npm install omise
```

### 3. PayPal Setup

#### Step 1: สร้าง PayPal Developer Account
```bash
# ไปที่ https://developer.paypal.com
# สร้าง App ใน Dashboard
# ดาวน์โหลด credentials
```

#### Step 2: Environment Variables
```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=sandbox  # หรือ live
```

## 📝 การใช้งาน

### 1. เปิดใช้งานในระบบยกเลิกการจอง

แก้ไข `cancel-booking-with-notifications.js`:

```javascript
// เพิ่มการ process refund อัตโนมัติ
import { processBookingRefund } from "@/services/refundService";

// หลังจากยกเลิกการจองสำเร็จ
if (refundAmount > 0) {
  // เรียก process refund อัตโนมัติ
  const refundResult = await processBookingRefund({
    bookingId: bookingId,
    paymentMethod: payment.payment_method,
    paymentId: payment.gateway_payment_id,
    refundAmount: refundAmount,
    refundReason: cancellationReason,
    originalAmount: originalAmount,
    userId: user.id
  });
  
  if (refundResult.success) {
    console.log('Refund processed automatically:', refundResult.refundId);
  }
}
```

### 2. API Endpoints

#### Process Refund
```bash
POST /api/refund/process-refund
{
  "bookingId": "uuid",
  "cancellationId": "uuid"
}
```

#### Check Refund Status
```bash
GET /api/refund/status?refundId=re_xxx
```

### 3. Frontend Integration

```javascript
// ในหน้า Cancellation History
const processRefund = async (cancellationId, bookingId) => {
  try {
    const response = await axios.post('/api/refund/process-refund', {
      bookingId,
      cancellationId
    });
    
    if (response.data.success) {
      alert(`คืนเงินสำเร็จ! จำนวน THB ${response.data.refundAmount}`);
    }
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการคืนเงิน');
  }
};
```

## 🔄 Webhook Configuration

### Stripe Webhook Events
```json
{
  "enabled_events": [
    "refund.updated"
  ],
  "url": "https://yourdomain.com/api/webhook/refund-status?provider=stripe"
}
```

### Omise Webhook Events
```json
{
  "enabled_events": [
    "refund.update"
  ],
  "url": "https://yourdomain.com/api/webhook/refund-status?provider=omise"
}
```

### PayPal Webhook Events
```json
{
  "enabled_events": [
    "PAYMENT.CAPTURE.REFUNDED"
  ],
  "url": "https://yourdomain.com/api/webhook/refund-status?provider=paypal"
}
```

## 💰 ตัวอย่างการทำงาน

### 1. การคืนเงินเต็มจำนวน
```javascript
const refundData = {
  bookingId: "booking-123",
  paymentMethod: "stripe",
  paymentId: "pi_1234567890",
  refundAmount: 500.00,
  refundReason: "Customer cancellation",
  originalAmount: 500.00,
  userId: "user-123"
};

const result = await processBookingRefund(refundData);
// Result: { success: true, refundId: "re_xxx", status: "processing" }
```

### 2. การคืนเงินบางส่วน
```javascript
const refundData = {
  bookingId: "booking-123",
  paymentMethod: "stripe", 
  paymentId: "pi_1234567890",
  refundAmount: 375.00,  // 75% refund
  refundReason: "Late cancellation",
  originalAmount: 500.00,
  userId: "user-123"
};
```

## 📊 Database Schema

### booking_cancellations table extensions
```sql
-- เพิ่ม columns สำหรับ refund tracking
ALTER TABLE booking_cancellations ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
ALTER TABLE booking_cancellations ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE booking_cancellations ADD COLUMN IF NOT EXISTS refund_processed_date TIMESTAMPTZ;
ALTER TABLE booking_cancellations ADD COLUMN IF NOT EXISTS refund_completed_date TIMESTAMPTZ;
ALTER TABLE booking_cancellations ADD COLUMN IF NOT EXISTS estimated_refund_date TIMESTAMPTZ;
ALTER TABLE booking_cancellations ADD COLUMN IF NOT EXISTS gateway_response JSONB;
ALTER TABLE booking_cancellations ADD COLUMN IF NOT EXISTS refund_method VARCHAR(50);
ALTER TABLE booking_cancellations ADD COLUMN IF NOT EXISTS refund_error TEXT;
```

### payments table requirements
```sql
-- ต้องมี gateway_payment_id สำหรับ refund
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
```

## 🔍 การทดสอบ

### Test Mode
```env
# ใช้ Test Keys ก่อนเสมอ
STRIPE_SECRET_KEY=sk_test_xxxxx
OMISE_SECRET_KEY=skey_test_xxxxx
PAYPAL_ENVIRONMENT=sandbox
```

### Test Cards
```javascript
// Stripe Test Cards
const testCards = {
  success: "4242424242424242",
  decline: "4000000000000002",
  refundable: "4000000000000077"
};
```

### Testing APIs
```bash
# Test refund service status
curl http://localhost:3000/api/test/refund-status

# Test refund processing
curl -X POST http://localhost:3000/api/refund/process-refund \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"test-123","cancellationId":"cancel-123"}'
```

## ⚠️ ข้อควรระวัง

### Security
- ✅ **ตรวจสอบ webhook signature** เสมอ
- ✅ **ใช้ HTTPS** สำหรับ webhook endpoints
- ✅ **Validate refund amount** ก่อน process
- ✅ **Log ทุก transaction** เพื่อ audit trail

### Business Logic
- ✅ **ตรวจสอบเงื่อนไขการคืนเงิน** ตามนโยบาย
- ✅ **จำกัดจำนวนครั้ง** ของการคืนเงิน
- ✅ **ตั้งค่า timeout** สำหรับ API calls
- ✅ **Handle duplicate requests** ด้วย idempotency

### Monitoring
```javascript
// เพิ่ม monitoring และ alerting
const refundMetrics = {
  totalRefunds: 0,
  failedRefunds: 0,
  avgProcessingTime: 0,
  totalAmount: 0
};
```

## 🚀 Production Deployment

### Environment Variables
```env
# Production Settings
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
OMISE_SECRET_KEY=skey_live_xxxxx
PAYPAL_ENVIRONMENT=live

# Security
REFUND_DAILY_LIMIT=50000  # THB per day
REFUND_RATE_LIMIT=10      # requests per minute
```

### Webhook URLs
```bash
# Production Webhook URLs
https://yourdomain.com/api/webhook/refund-status?provider=stripe
https://yourdomain.com/api/webhook/refund-status?provider=omise  
https://yourdomain.com/api/webhook/refund-status?provider=paypal
```

## 📈 Monitoring & Analytics

### คำสั่ง SQL สำหรับ monitoring
```sql
-- สถิติการคืนเงินรายวัน
SELECT 
  DATE(refund_processed_date) as refund_date,
  COUNT(*) as total_refunds,
  SUM(refund_amount) as total_amount,
  AVG(refund_amount) as avg_amount
FROM booking_cancellations 
WHERE refund_status = 'completed'
  AND refund_processed_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(refund_processed_date)
ORDER BY refund_date DESC;

-- สถานะการคืนเงิน
SELECT 
  refund_status,
  COUNT(*) as count,
  SUM(refund_amount) as total_amount
FROM booking_cancellations
WHERE refund_amount > 0
GROUP BY refund_status;
```

## 🆘 Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. Refund Failed
```bash
# ตรวจสอบ payment ID
# ตรวจสอบ amount ไม่เกิน original
# ตรวจสอบ gateway credentials
```

#### 2. Webhook ไม่ทำงาน
```bash
# ตรวจสอบ URL endpoint
# ตรวจสอบ signature verification
# ตรวจสอบ enabled events
```

#### 3. Database Error
```bash
# ตรวจสอบ required columns
# ตรวจสอบ data types
# ตรวจสอบ foreign key constraints
```

---

## 🎯 ขั้นตอนสำคัญ

1. **เลือก Payment Gateway** (แนะนำ Stripe)
2. **ตั้งค่า Environment Variables**
3. **ติดตั้ง Dependencies** 
4. **Config Webhooks**
5. **ทดสอบใน Test Mode**
6. **Deploy to Production**

ระบบคืนเงินจริงพร้อมใช้งาน! 💳✨ 