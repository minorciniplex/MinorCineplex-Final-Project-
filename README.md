# Minor Cineplex

ระบบจองตั๋วหนังออนไลน์สำหรับ Minor Cineplex พัฒนาด้วย Next.js และ Supabase

## 🚀 เทคโนโลยีที่ใช้

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: Stripe
- **Deployment**: Vercel

## 📋 คุณสมบัติหลัก

- ระบบสมาชิก (สมัครสมาชิก, เข้าสู่ระบบ, จัดการโปรไฟล์)
- ดูรายการหนังที่กำลังฉายและจะฉาย
- ค้นหาหนังตามชื่อ, ประเภท, ภาษา
- ดูรายละเอียดหนัง (เรื่องย่อ, นักแสดง, เวลาฉาย)
- จองตั๋วหนังออนไลน์
- เลือกที่นั่ง
- ชำระเงินผ่าน Stripe
- ดูประวัติการจอง
- ระบบค้นหาภาพยนตร์
- แสดงโรงหนังใกล้เคียง
- รองรับหลายภาษา (TH/EN)

## 🛠️ การติดตั้ง

1. Clone repository:
```bash
git clone https://github.com/your-username/minor-cineplex.git
cd minor-cineplex
```

2. ติดตั้ง dependencies:
```bash
npm install
```

3. สร้างไฟล์ .env.local และกำหนดค่า environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. รัน development server:
```bash
npm run dev
```

## 📁 โครงสร้างโปรเจค

```
minor-cineplex/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components
│   │   ├── sections/     # Page sections
│   │   └── layout/       # Layout components
│   ├── pages/            # Next.js pages
│   ├── styles/           # Global styles
│   └── utils/            # Utility functions
├── public/               # Static files
└── ...
```

## 🔑 ฐานข้อมูล

### ตารางหลัก
- users
- movies
- cinemas
- showtimes
- seats
- bookings
- payments
- languages
- movie_languages

## 👥 ทีมพัฒนา

- [ชื่อ-นามสกุล] - Role
- [ชื่อ-นามสกุล] - Role
- [ชื่อ-นามสกุล] - Role
- [ชื่อ-นามสกุล] - Role
- [ชื่อ-นามสกุล] - Role

## 📝 License

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file
