# 🎬 Minor Cineplex

An intuitive movie ticket booking platform where users can quickly find films, discover nearby cinemas, choose their seats in real-time, and enjoy a seamless checkout experience.

---

## 📌 Project Description

**Minor Cineplex** is an online movie ticket booking platform that allows users to:

- Discover nearby cinemas using geolocation
- Browse movie schedules and details
- Book seats in real-time with an interactive interface
- Make secure payments via Stripe and Omise (QR code supported)
- Share bookings with friends and manage personal reservations

Authentication, password management, and personal dashboards ensure a secure and personalized user experience.

---

## 🧰 Technologies Used

**Frontend:**

- ⚛️ Next.js, React
- 🎨 Tailwind CSS

**Backend:**

- 🛠️ Supabase (PostgreSQL)

**Authentication:**

- 🔐 Supabase Auth

**Payment:**

- 💳 Stripe, Omise

**Deployment:**

- 🚀 Vercel

---

## 🌟 Key Features

- 🔐 User system: Register, login, profile management
- 🎬 Browse: Now showing and upcoming movies
- 🔍 Search: By name, genre, language, city, and release date
- 📍 Nearby cinemas: Based on geolocation
- 📝 Movie details: Synopsis, genre, runtime, showtimes
- 🎟️ Online ticket booking with real-time seat selection
- 💰 Payment via Stripe and Omise (QR)
- 📂 View booking history and ticket details

---

## 💡 Why These Technologies?

- **Next.js & React** for fast development, routing, and SEO
- **Supabase** provides real-time, scalable backend and secure authentication
- **Stripe & Omise** ensure reliable and secure online payments
- **Vercel** allows quick deployment, preview URLs, and team collaboration

---

## 📚 Table of Contents

- [Project Description](#-project-description)
- [Technologies Used](#-technologies-used)
- [Key Features](#-key-features)
- [Why These Technologies?](#-why-these-technologies)
- [Installation & Usage](#-installation--usage)
- [Usage Guide](#-usage-guide)
- [Project Architecture](#-project-architecture)
- [Database Schema](#-database-schema)
- [Contributors](#-contributors)
- [Acknowledgments](#-acknowledgments)

---

## ⚙️ Installation & Usage

### 1. Clone the repository

```bash
git clone https://github.com/minorciniplex/MinorCineplex-Final-Project-.git
cd MinorCineplex-Final-Project-
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

Create a .env.local file in the root directory and fill in the following values:

<details> <summary>Click to expand environment variables</summary>

```bash
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_PROJECT_REF=your-project-ref

# AUTH
NEXTAUTH_URL=https://your-deployment.vercel.app/

# ENVIRONMENT
NODE_ENV=development
ADMIN_JWT_SECRET=your-admin-secret

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# STRIPE
STRIPE_SECRET_KEY=your-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key

# OMISE
OMISE_PUBLIC_KEY=your-public-key
OMISE_SECRET_KEY=your-secret-key

# SMTP Email
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_NOTIFICATIONS_ENABLED=true

```

</details>

### 4. Run the development server

```bash
npm run dev
```

Open your browser at: http://localhost:3000

---

## 🎯 Usage Guide

### For Users
1. **🔐 Account Setup**: 
-Registration: Create account with email, first name, last name, and password
-Login/Logout: Sign in and out using registered credentials
-Profile Management: Edit personal information in Profile page
-Session Management: Automatic session handling by the system

2. **🎬 Browse Movies**: 
-Movie Catalog: View all available movies in the Movies page
-Movie Details: See movie information including poster, synopsis, and duration
-Genre Information: Browse movies by different categories
-Movie Search: Search for movies by title or genre

3. **📍 Find Cinemas**: 
-Cinema Locations: View list of all cinema locations
-Cinema Details: See cinema information including address and contact details
-Theater Information: Check number and types of screening rooms

4. **🎫 Book Tickets**: 
-Showtime Selection: Choose screening times from the schedule
-Seat Selection: Pick seats from the cinema seating map
-Booking Process: Fill in booking details and confirm reservation
-Payment: Complete payment process and receive tickets


5. **📱 Manage Bookings**: 
-Booking History: View all booking records in My Bookings page
-Booking Details: Check detailed information for each booking
-Ticket Status: Monitor ticket status (Active, Used, Cancelled)
-Booking Cancellation: Cancel bookings (subject to terms and conditions)

---

## 📂 Project Architecture

```
MinorCineplex-Final-Project/
├── ⚙️.github/  workflows           # GitHub Actions and workflows configuration
├── 📦.next/ build                  # Next.js production build directory
├── 🌐public/ static                # Static files directory
│ ├── 🎨assets/                     # Various assets
│ └── 🖼️images/                     # Project images
│
├── 💻src/ code                     # Main application code
│ ├── 🧩components/                 # Reusable React components
│ ├── 🔗context/                    # React Context for state management
│ ├── 🎣hooks/                      # Custom React hooks
│ ├── 📚lib/                        # Base libraries and utilities
│ ├── 🚦middleware/                 # Middleware functions
│ │ 
│ ├── 📄pages/                      # Next.js pages
│ │     ├──🔌api                      # Api Endpoint
│ │     ├──🔐auth                     # Authentication page
│ │     ├──🎟️booking                  # Booking page
│ │     ├──🎫coupons                  # Coupons page
│ │     └──💳payment                  # Payment page
│ │ 
│ ├── 📞services/                   # Services (API calls, etc.)
│ ├── 💅styles/                     # CSS and styling files
│ └── 🛠️utils/                      # Utility functions
│
├── 🚀supabase/ database  Supabase  # Supabase configuration and related files
├── 🚫.gitignore                    # Git ignore rules
├── ⚙️next.config.js Next.js        # Next.js configuration
├── 📝package.json npm              # Project metadata and dependencies
└── 📜README.md docs                # Project documentation
```

---

## 🗄️ Database Schema

<details>
<summary><strong>Core Tables Overview</strong></summary>

| Table       | Purpose              | Key Features                        |
| ----------- | -------------------- | ----------------------------------- |
| `users`     | User management      | Profiles, preferences, auth data    |
| `movies`    | Film catalog         | Metadata, ratings, media assets     |
| `cinemas`   | Venue information    | Locations, facilities, pricing      |
| `showtimes` | Schedule management  | Real-time availability              |
| `seats`     | Seating arrangements | Layout, availability                |
| `bookings`  | Reservation tracking | Status, timestamps, user relations  |
| `payments`  | Transaction records  | Payment methods, status, receipts   |
| `coupons`   | Promotion system     | Discounts, validity, usage tracking |

</details>

---

## 👨‍💻 Contributors

- [Pawarit Sripayom](https://github.com/Wizardsmile1412) – Showtimes & Seat booking Features and Showtimes and Movie database
- [Passawit Rungpichayanukul](https://github.com/Jin111-1) – Coupons & Time Remaining Handler & Booking sharing
- [Wuttichai Jeenkaew](https://github.com/wuttichai-jeenkaew) - Authentication & User Dashboard
- [Sanya Bochoun](https://github.com/sanya-bochoun/) - Distance Cinema & Payment system & Admin Dashboard
- [Chalunton Vipusanapas](https://github.com/ChaLconner) - Showtimes & UI Integrator

---

## 🙏 Acknowledgments

- [Techup Thailand](https://www.techupth.com/)
- Movie data provided by [Internet Movie Database (IMDb)](https://www.imdb.com/)
- Inspiration from modern cinema booking platforms

---

<div align="center">
  <p>Made with ❤️ by the Minor Cineplex Team</p>
  <p>
    <a href="#-table-of-contents">Back to Top ⬆️</a>
  </p>
</div>
