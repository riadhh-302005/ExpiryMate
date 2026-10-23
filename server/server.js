// ============================================================================
// File: server/server.js
// 1. What this file does:
//    This is the main starting file of our backend. It starts the Express server,
//    connects to MongoDB, sets up security (CORS, cookies), and activates our API routes.
// 2. Why this file exists:
//    Every Node.js backend needs one central file to start up the app and listen
//    for requests sent from the React frontend.
// 3. Important points to remember:
//    - Starts the server on port 5000 (or the port set in .env).
//    - Sets up CORS so our React frontend on port 5173 can send requests.
//    - Sets up cookie-parser so we can read the user's secure login token.
//    - Starts the daily reminder timer (cron job) to check for expiring warranties.
// 4. How it connects to other parts:
//    - Connects to MongoDB using 'config/db.js'.
//    - Forwards requests to 'routes/authRoutes.js', 'routes/purchaseRoutes.js',
//      and 'routes/dashboardRoutes.js'.
// ============================================================================

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
require('./config/cloudinary'); // Initialize Cloudinary if credentials present
const { initReminderJob } = require('./jobs/reminderJob');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Error handling middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// 1. CORS Configuration
const rawOrigins = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map((url) => url.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server) or listed origins
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      // Also allow if deployed on Vercel / Netlify
      return callback(null, true);
    },
    credentials: true, // Allow cookies and authorization headers across origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 2. Global Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Serve local uploaded receipt files (for dev fallback when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Root & Health check endpoints (Returns 200 OK for uptime pingers, cron-job.org, and browsers)
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ExpiryMate API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 6. Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

// 7. Start scheduled cron tasks
initReminderJob();

// 8. Start HTTP Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[ExpiryMate Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[ExpiryMate Server] API base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown handling
process.on('unhandledRejection', (err) => {
  console.error(`[UnhandledRejection] Shutting down server: ${err.message}`);
  server.close(() => process.exit(1));
});
