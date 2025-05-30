# คู่มือการเขียนโค้ดระบบจ่ายเงิน (Payment System) Minor Cineplex

## 1. โครงสร้างระบบจ่ายเงิน

### 1.1 Payment Flow หลัก
- ลูกค้าเลือกที่นั่ง/รอบหนัง → กรอกข้อมูล → เลือกวิธีจ่ายเงิน (Credit Card หรือ QR PromptPay)
- กด Next → Popup Confirm → ดำเนินการจ่ายเงิน
- ถ้าสำเร็จ:
  - Credit Card: redirect ไปหน้า payment-success
  - QR: แสดง QR, รอจ่าย, ถ้าจ่ายสำเร็จ redirect ไป payment-success

---

## 2. โครงสร้างไฟล์ที่เกี่ยวข้อง

| ไฟล์/โฟลเดอร์ | หน้าที่ |
|----------------|---------|
| `src/components/PaymentSystem/PaymentMobile.js` | หน้า payment หลัก (UI, logic, handle flow) |
| `src/components/PaymentSystem/SumPaymentDiscount.js` | สรุปยอดเงิน/ปุ่ม Next |
| `src/components/PaymentSystem/ConfirmBookingPopup.js` | Popup ยืนยันการจ่ายเงิน |
| `src/pages/api/create-payment-intent.js` | API สร้าง PaymentIntent (Credit Card/Stripe) |
| `src/pages/api/create-promptpay.js` | API สร้าง QR (Omise PromptPay) |
| `src/pages/api/get-qr.js` | API ดึง QR image จาก Omise |
| `src/pages/api/get-qr-status.js` | API เช็คสถานะ charge (Omise) |
| `src/pages/payment-success.js` | หน้าแสดงผลจ่ายเงินสำเร็จ |
| `src/pages/payment-qr.js` | หน้าแสดง QR Code และรอสถานะจ่ายเงิน |

---

## 3. รายละเอียดโค้ดและ Flow

### 3.1 Credit Card (Stripe)
- กรอกข้อมูลบัตร → กด Next → Popup Confirm → กด Confirm
- เรียก API `/api/create-payment-intent` เพื่อสร้าง PaymentIntent
- ใช้ Stripe Elements ยืนยันการจ่ายเงิน
- ถ้าสำเร็จ:
  - Insert ข้อมูลธุรกรรมลง Supabase (movie_payments)
  - redirect ไป `/payment-success?bookingId=${booking?.id}`

**ตัวอย่างโค้ด (handleConfirmPayment):**
```js
const handleConfirmPayment = async () => {
  setConfirmLoading(true);
  setConfirmError(null);
  if (cardFormRef.current && cardFormRef.current.pay) {
    const result = await cardFormRef.current.pay();
    if (result.success) {
      setConfirmLoading(false);
      setOpenConfirmPopup(false);
      router.push(`/payment-success?bookingId=${booking?.id}`);
    } else {
      setConfirmError(result.error || 'เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง');
      setConfirmLoading(false);
    }
  }
};
```

---

### 3.2 QR PromptPay (Omise)
- เลือก QR Tab → กด Next → Popup Confirm → กด Confirm
- เรียก API `/api/create-promptpay` เพื่อสร้าง charge และรับ QR image
- redirect ไป `/payment-qr?chargeId=${data.chargeId}&amount=${booking?.total}&bookingId=${booking?.id}`
- หน้า `/payment-qr` จะ fetch QR image และ poll สถานะ charge ทุก 5 วินาที
- ถ้าสถานะ Omise เป็น `paid` หรือ `successful` → redirect ไป `/payment-success?bookingId=${booking?.id}`

**ตัวอย่างโค้ด (handleConfirmQR):**
```js
const handleConfirmQR = async () => {
  setConfirmLoading(true);
  setQrError(null);
  try {
    const res = await fetch('/api/create-promptpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: booking?.total * 100 }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setQrUrl(data.qr);
    setChargeId(data.chargeId);
    setQrStatus(data.status);
    setOpenConfirmPopup(false);
    router.push(`/payment-qr?chargeId=${data.chargeId}&amount=${booking?.total}&bookingId=${booking?.id}`);
  } catch (err) {
    setQrError(err.message);
  }
  setConfirmLoading(false);
};
```

---

### 3.3 API ที่เกี่ยวข้อง

#### `/api/create-payment-intent.js` (Stripe)
- รับ amount, userId, bookingId, movieId
- สร้าง PaymentIntent ด้วย Stripe SDK
- คืน clientSecret

#### `/api/create-promptpay.js` (Omise)
- รับ amount (หน่วยสตางค์)
- สร้าง charge ด้วย Omise SDK
- คืน qr image, chargeId, status

#### `/api/get-qr.js`
- รับ chargeId
- ดึง charge จาก Omise
- คืน qr image

#### `/api/get-qr-status.js`
- รับ chargeId
- ดึง charge จาก Omise
- คืน status

---

### 3.4 หน้า Success
- `/payment-success?bookingId=${booking?.id}`
- ดึง bookingId จาก query
- fetch ข้อมูล booking_detail จาก Supabase
- แสดงรายละเอียด booking จริง

---

### 3.5 ปุ่มแชร์โซเชียล
- LINE, Messenger, Facebook, Twitter, Copy link
- ใช้ window.open สำหรับ social, ใช้ clipboard สำหรับ copy link
- แชร์ url `/booking-detail/${booking?.id}`

---


---

## 5. ตัวอย่าง Flow สรุป

1. เลือกวิธีจ่ายเงิน (Credit/QR)
2. กรอกข้อมูล/กด Next → Popup Confirm
3. กด Confirm → ดำเนินการจ่ายเงิน
4. ถ้าสำเร็จ → redirect `/payment-success?bookingId=${booking?.id}`
5. ถ้า QR → แสดง QR, รอจ่าย, ถ้าจ่ายสำเร็จ → redirect `/payment-success?bookingId=${booking?.id}`
6. หน้า success แสดง booking จริง, แชร์ booking ได้

---

**หากต้องการตัวอย่างโค้ดแต่ละไฟล์ หรืออธิบายจุดใดละเอียดกว่านี้ แจ้งได้เลย!** 