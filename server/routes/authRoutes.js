// ============================================================================
// File: server/routes/authRoutes.js
// 1. What this file does:
//    Defines the web addresses (routes) for account actions:
//    signing up (/register), signing in (/login), signing out (/logout), and checking login status (/me).
// 2. Why this file exists:
//    It acts as a directory mapping URLs to the right controller functions.
// 3. Important points to remember:
//    - /register and /login are open to anyone.
//    - /me uses 'protect' middleware to make sure only logged-in users can view their profile.
// 4. How it connects to other parts:
//    - Mounted at '/api/auth' inside 'server.js'.
//    - Directs requests to 'controllers/authController.js'.
// ============================================================================

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
