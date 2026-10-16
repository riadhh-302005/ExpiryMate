# ExpiryMate — Receipt & Warranty Tracker

> **A clean, beginner-friendly, full-stack MERN web application to store purchase receipts, track return deadlines and warranty expirations in real time, view expense analytics, and receive automated email reminders.**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites & Environment Configuration](#prerequisites--environment-configuration)
6. [Installation & Setup](#installation--setup)
7. [Running the Application](#running-the-application)
8. [Configuring Cloudinary Storage](#configuring-cloudinary-storage)
9. [Configuring Email Reminders](#configuring-email-reminders)
10. [REST API Endpoints](#rest-api-endpoints)
11. [Important Implementation Decisions](#important-implementation-decisions)
12. [Known Limitations](#known-limitations)
13. [Deployment Considerations](#deployment-considerations)
14. [IMPORTANT POINTS TO REMEMBER (Interview Revision)](#important-points-to-remember-interview-revision)
15. [Frequently Asked Interview Questions](#frequently-asked-interview-questions)

---

## 1. Project Overview

**ExpiryMate** is a full-stack SaaS-style application built with the MERN stack (MongoDB, Express.js, React, Node.js). 

Consumers often purchase items, misplace their receipts, and lose hundreds of dollars when an item breaks right after the return window closes or just before a warranty expires. ExpiryMate solves this problem by:
- Storing receipts securely in the cloud (Cloudinary) with automatic local fallback storage in development.
- Calculating dynamic countdowns to return deadlines and warranty expiration dates.
- Displaying actionable status badges ("Return window open", "Deadline approaching", "Warranty active", "Warranty expired").
- Visualizing spending habits across categories and months with interactive Recharts.
- Scheduling automated daily email reminders using `node-cron` and `Nodemailer` with deduplication flags to prevent spam.
- Offering client-side OCR (Optical Character Recognition via Tesseract.js) to extract prices, dates, and store names from receipt photos.

---

## 2. Key Features

- **Secure JWT Authentication**: User registration and login with bcryptjs password hashing and dual HTTP-only cookie + Bearer token support.
- **Purchase & Receipt Management (CRUD)**: Create, view, edit, and delete purchases with receipt image or PDF attachments.
- **Live Deadline Calculations**: Dynamic days-remaining calculations (no outdated static countdown counters in the database).
- **Multi-Filter & Search Engine**: Live search by product name or seller, category filters, warranty status filter, and multi-field sorting.
- **Analytics Dashboard**: Total spend, registered purchases count, active warranties count, impending return alerts, monthly expense bar chart, and category spending donut chart.
- **Automated Email Reminders**: Scheduled daily cron job checking for upcoming return deadlines (≤ 3 days) and expiring warranties (≤ 30 days) with deduplication state.
- **Optional Receipt OCR**: Browser-based Tesseract.js scanner extracting merchant name, purchase date, and total price with user confirmation before applying.
- **Cloudinary Storage & Asset Cleanup**: Uploads receipts to Cloudinary and deletes cloud assets when purchase records are deleted.
- **Development-Friendly Fallbacks**: Runs seamlessly without requiring external Cloudinary or SMTP accounts.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18+ bootstrapped with [Vite](https://vitejs.dev/)
- **Language**: JavaScript (ES6+)
- **Routing**: React Router DOM (v6/v7)
- **HTTP Client**: Axios with interceptors and cookie credentials
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Visualization**: Recharts (PieChart and BarChart)
- **OCR Engine**: Tesseract.js

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **File Uploads**: Multer with memory storage
- **Cloud Storage**: Cloudinary SDK (with local disk fallback)
- **Job Scheduler**: `node-cron`
- **Email Delivery**: Nodemailer (with console preview dev mode)
- **Security & Config**: `dotenv`, `cors`, `cookie-parser`

---

## 4. Folder Structure

```
ExpiryMate/
├── client/                     # Frontend React (Vite) application
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI: Navbar, Sidebar, StatCard, Badge, ConfirmModal, ReceiptModal
│   │   │   ├── purchases/      # PurchaseCard, PurchaseFilters, OcrScanner
│   │   │   └── charts/         # CategorySpendingChart, MonthlySpendingChart
│   │   ├── context/            # AuthContext.jsx (global auth state)
│   │   ├── pages/              # 9 dedicated pages (Dashboard, Purchases, Add, Edit, Details, Deadlines, Profile, Login, Register)
│   │   ├── services/           # Axios network services (api.js, authService.js, purchaseService.js, dashboardService.js)
│   │   ├── utils/              # Date countdown calculations and formatters
│   │   ├── App.jsx             # Main routing skeleton and protected route guards
│   │   ├── main.jsx            # Application DOM root mount
│   │   └── index.css           # Tailwind CSS directives
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite config with API proxy
│   ├── tailwind.config.js      # Tailwind design tokens
│   ├── postcss.config.js       # PostCSS processor config
│   ├── package.json            # Client dependencies
│   └── .env.example            # Client environment variables
│
├── server/                     # Backend Node.js / Express application
│   ├── config/
│   │   ├── db.js               # Mongoose MongoDB connection
│   │   └── cloudinary.js       # Cloudinary SDK configuration
│   ├── controllers/
│   │   ├── authController.js   # User registration, login, logout, me
│   │   ├── purchaseController.js # Purchase CRUD and receipt uploads
│   │   └── dashboardController.js# Analytics metrics & upcoming deadlines
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT token verification (cookie & header)
│   │   ├── uploadMiddleware.js # Multer file validation and storage
│   │   └── errorMiddleware.js  # Centralized 404 & error handlers
│   ├── models/
│   │   ├── User.js             # Mongoose schema for user accounts
│   │   └── Purchase.js         # Mongoose schema for purchases & reminders
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth endpoints
│   │   ├── purchaseRoutes.js   # /api/purchases endpoints
│   │   └── dashboardRoutes.js  # /api/dashboard endpoints
│   ├── utils/
│   │   ├── dateCalculations.js # Dynamic countdown math & status labels
│   │   └── emailService.js     # Nodemailer transport & HTML alerts
│   ├── jobs/
│   │   └── reminderJob.js      # Daily node-cron scheduled reminder task
│   ├── uploads/                # Local storage fallback directory
│   ├── server.js               # Express application entry point
│   ├── package.json            # Server dependencies
│   └── .env.example            # Server environment variables
│
└── README.md                   # Comprehensive documentation and study guide
```

---

## 5. Prerequisites & Environment Configuration

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB server running on port `27017` (e.g. `mongodb://localhost:27017/expirymate`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

### Environment Files

#### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expirymate
JWT_SECRET=supersecret_jwt_key_change_in_production_12345
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary (leave empty to use local /uploads storage in dev)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Nodemailer (leave empty to use terminal console logger in dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="ExpiryMate Reminders" <no-reply@expirymate.local>
```

#### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_BASE_URL=/api
```

---

## 6. Installation & Setup

1. **Clone or navigate to the repository:**
   ```bash
   cd ExpiryMate
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

## 7. Running the Application

### Option 1: Running in Two Terminals (Recommended for Development)

**Terminal 1 (Backend):**
```bash
cd server
npm start
# Server boots at http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Frontend boots at http://localhost:5173
```

Open your browser to `http://localhost:5173`.

---

## 8. Configuring Cloudinary Storage

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. On your Cloudinary Dashboard, locate:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Open `server/.env` and fill in the values:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart the server. Uploads will now be automatically streamed directly to Cloudinary folder `expirymate/receipts`.
5. When a purchase is deleted, its Cloudinary asset is automatically removed using the stored `receiptPublicId`.

> **Note for Beginners:** If these credentials are left blank, ExpiryMate continues working seamlessly by saving files to `server/uploads/`.

---

## 9. Configuring Email Reminders

1. By default, ExpiryMate operates in **Development Simulation Mode**: whenever the cron job triggers or you click "Test Email Reminders Now", a formatted preview of the email is printed directly to the server terminal console.
2. To send live emails with Gmail:
   - Go to your Google Account -> **Security** -> **2-Step Verification**.
   - Create an **App Password** for "Mail".
   - Put your credentials in `server/.env`:
     ```env
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASSWORD=your_16_digit_app_password
     ```
3. Restart the server. The daily cron job runs at **08:00 AM** (`0 8 * * *`). You can also trigger an immediate test run from the **Profile & Settings** page at `/profile`.

---

## 10. REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Log in and receive HTTP-only cookie + token | Public |
| `POST` | `/api/auth/logout` | Clear auth cookie | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |

### Purchases (`/api/purchases`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/purchases` | Query purchases (search, category, status, sort) | Private |
| `POST` | `/api/purchases` | Create new purchase with receipt file upload | Private |
| `GET` | `/api/purchases/:id` | Get purchase by ID with dynamic countdown data | Private |
| `PUT` | `/api/purchases/:id` | Update purchase details / replace receipt | Private |
| `DELETE`| `/api/purchases/:id` | Delete purchase & clean up Cloudinary asset | Private |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregate spending, category, and monthly stats | Private |
| `GET` | `/api/dashboard/upcoming`| Fetch return & warranty deadlines ordered by urgency | Private |
| `POST`| `/api/dashboard/trigger-reminders` | Manually run reminder scan (testing endpoint) | Private |

---



