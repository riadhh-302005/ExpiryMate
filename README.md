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

## 11. Important Implementation Decisions

1. **Dynamic Countdown Math vs. Static Fields**:
   Countdowns change every single day. Storing a static `daysRemaining` integer in MongoDB would quickly become obsolete. ExpiryMate stores the immutable `purchaseDate`, `returnDeadline`, and `warrantyEndDate` in MongoDB and dynamically computes `daysRemaining` and status labels at request time.

2. **Deduplication of Email Reminders**:
   A scheduled job running daily must not send the exact same reminder every 24 hours. Each `Purchase` document contains a `remindersSent: { returnDeadline: Boolean, warrantyExpiry: Boolean }` object. Once an email is sent, the respective flag is marked `true`. If the user updates the deadline date to a future date in Edit mode, the flag automatically resets to `false`.

3. **Dual Token Extraction**:
   Authentication reads from `req.cookies.token` first (safest against XSS) and falls back to `Authorization: Bearer <token>` in request headers. This allows seamless operation in strict browser cookie environments and makes testing via cURL or Postman effortless.

4. **Zero-Overhead File Storage Architecture**:
   Multer buffers files in memory (`multer.memoryStorage()`). If Cloudinary credentials are provided, the buffer streams directly to Cloudinary. If not, it writes to `server/uploads/` and serves via Express static routes.

5. **Client-Side OCR**:
   OCR runs completely inside the browser using `tesseract.js`, avoiding expensive third-party OCR API dependencies or complex native server binaries. The user can review all extracted values before saving.

---

## 12. Known Limitations

- **PDF OCR**: Browser-based Tesseract.js directly scans image formats (PNG, JPG, WEBP). For PDF receipts, text extraction requires rendering PDF pages into canvas bitmaps first; PDF attachments are currently stored and previewed directly.
- **Serverless Cron Timing**: On free hosting tiers that sleep after inactivity (such as free Render or Fly.io instances), background cron timers pause while the instance sleeps. For production deployments on sleeping dynos, trigger reminders using external cron services (e.g. Cron-Job.org) pointing to `/api/dashboard/trigger-reminders`.

---

## 13. Deployment Considerations

- **Backend**: Can be deployed to Render, Railway, Heroku, or AWS EC2. Ensure environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`) are configured in the dashboard.
- **Frontend**: Can be deployed to Vercel, Netlify, or Render Static Sites. Set `VITE_API_BASE_URL` to your production backend URL (e.g., `https://api.expirymate.com/api`).
- **CORS**: Set `CLIENT_URL` on the backend to match the exact production domain of the frontend.

---

## 14. IMPORTANT POINTS TO REMEMBER (Interview Revision)

### 1. How JWT Authentication Works
- A JSON Web Token consists of three parts separated by dots: **Header**, **Payload**, and **Signature** (`header.payload.signature`).
- When a user logs in with valid credentials, the server signs a payload containing the user's `_id` using a secret key (`jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' })`).
- The client passes this token on future requests. The server verifies the token signature (`jwt.verify(token, JWT_SECRET)`). If the signature matches, the server trusts the user ID in the payload without needing a server-side session table.

### 2. Why Passwords Must Be Hashed
- Plaintext passwords stored in a database are vulnerable to data breaches and insider threats.
- `bcryptjs` uses a **salted one-way cryptographic hash function**. The salt is a random string added before hashing to ensure identical passwords generate completely different hashes, protecting against rainbow table attacks.
- `bcrypt.compare()` re-hashes the user's submitted password with the stored salt to test equality without ever decrypting the original password.

### 3. How Protected Routes Work
- **Backend**: Express middleware (`protect`) intercepts requests before they reach the controller. It verifies the token, looks up `User.findById(decoded.id)`, attaches the document to `req.user`, and calls `next()`. If the token is missing or invalid, it returns `401 Unauthorized`.
- **Frontend**: The React `ProtectedRoute` wrapper inspects `useAuth().isAuthenticated`. If false, it renders `<Navigate to="/login" replace />`.

### 4. How MongoDB Relationships and User Ownership Work
- In `Purchase.js`, the schema defines `user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }`.
- In `purchaseController.js`, queries always scope by `user: req.user._id`.
- On single-item operations (`getById`, `update`, `delete`), the controller checks `purchase.user.toString() === req.user._id.toString()`. Never trust a `userId` sent from the frontend request body!

### 5. How Cloudinary Uploads Work
- Multer processes `multipart/form-data` and loads the file buffer into `req.file.buffer`.
- The buffer is streamed to Cloudinary using `cloudinary.uploader.upload_stream`.
- Cloudinary saves the file, returns a secure HTTPS URL (`result.secure_url`) and a unique identifier (`result.public_id`).
- When deleting a purchase, `cloudinary.uploader.destroy(purchase.receiptPublicId)` removes the asset from cloud storage, preventing orphaned files.

### 6. How Dynamic Countdowns Are Calculated
- Dynamic calculations use midnight-to-midnight full calendar days:
  ```javascript
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24));
  ```
- This avoids hour/minute discrepancies and daylight saving timezone drift.

### 7. How Scheduled Email Reminders Work
- `node-cron` registers a background job inside the running Node.js process using cron syntax (e.g. `0 8 * * *` = 8:00 AM daily).
- When triggered, it queries MongoDB for purchases with deadlines falling within reminder windows (e.g., return deadline in ≤ 3 days, warranty in ≤ 30 days).
- Nodemailer sends the notification and updates the document.

### 8. How Duplicate Reminders Are Prevented (Idempotency)
- The Purchase document contains a `remindersSent` object:
  ```javascript
  remindersSent: {
    returnDeadline: false,
    warrantyExpiry: false
  }
  ```
- The cron query filters only purchases where `remindersSent.<type>: false`.
- After sending an email, `purchase.remindersSent.<type> = true; await purchase.save();` ensures subsequent cron runs skip that item.

### 9. Why Environment Variables Are Necessary
- Hardcoding secrets (database URIs, JWT secrets, Cloudinary keys, SMTP passwords) in source code creates severe security vulnerabilities if code is committed to GitHub.
- `dotenv` loads configuration from a `.env` file into `process.env` at runtime.
- `.env` is listed in `.gitignore` so secrets are never pushed to version control.

### 10. Common Bugs & Debugging Strategies
- **CORS Errors**: Check `server.js` `cors({ origin: 'http://localhost:5173', credentials: true })` and ensure `withCredentials: true` is set on Axios.
- **CastError on ObjectId**: Happens when passing an invalid MongoDB ID string. Centralized error handling catches `err.name === 'CastError'` and responds with `400 Bad Request`.
- **Form Data Uploads**: When uploading files via Axios, omit manually setting `'Content-Type': 'multipart/form-data'` or let Axios generate the boundary header automatically with `FormData`.

---

## 15. Frequently Asked Interview Questions

<details>
<summary><strong>Q1: What is the difference between storing JWT in LocalStorage vs. an HTTP-only Cookie?</strong></summary>

**Answer:** LocalStorage is accessible to any JavaScript running on the page, making it vulnerable to Cross-Site Scripting (XSS) attacks. An HTTP-only cookie cannot be read by client-side JavaScript, preventing script injection from stealing the token. To protect against Cross-Site Request Forgery (CSRF) when using cookies, appropriate `SameSite` flags (`SameSite=Lax` or `Strict`) and CORS credentials restrictions are applied.
</details>

<details>
<summary><strong>Q2: Why did you compute days remaining dynamically instead of storing a countdown in MongoDB?</strong></summary>

**Answer:** A countdown is a time-dependent value that changes every 24 hours. If we stored an integer like `daysRemaining: 10`, that integer would become outdated the very next day unless an expensive batch database update ran on every document every night. Storing immutable target dates (`warrantyEndDate`) and calculating remaining days at query time ensures 100% accuracy with zero write overhead.
</details>

<details>
<summary><strong>Q3: How do you prevent User A from accessing User B's purchases?</strong></summary>

**Answer:** We enforce user data isolation at both the database query level and the controller authorization level. In `getPurchases`, we query `Purchase.find({ user: req.user._id })`. For single-item endpoints (`getById`, `update`, `delete`), we verify `purchase.user.toString() === req.user._id.toString()`. If they do not match, we immediately return `403 Forbidden`. The `req.user` object is derived strictly from the verified JWT, never from user-supplied request parameters.
</details>

<details>
<summary><strong>Q4: How does Multer handle file uploads, and why did you choose memoryStorage over diskStorage?</strong></summary>

**Answer:** Multer parses `multipart/form-data` request payloads. With `memoryStorage()`, the uploaded file is held in a temporary memory Buffer (`req.file.buffer`). This is ideal for cloud uploads because we can stream the buffer directly to Cloudinary without writing temporary files to server disk. In our project, if Cloudinary credentials are absent, we cleanly write the buffer to a local `/uploads` directory as a developer fallback.
</details>

<details>
<summary><strong>Q5: What happens if Cloudinary upload fails mid-request?</strong></summary>

**Answer:** In `purchaseController.js`, the file upload step executes before saving the purchase document in MongoDB. If the upload stream throws an error, the controller catches the error and rejects the request with a `400/500` status. This prevents the database from storing invalid purchase documents with broken receipt URLs.
</details>

---

## License
MIT License. Built for learning and interview preparation.
