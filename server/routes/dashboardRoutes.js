// ============================================================================
// File: server/routes/dashboardRoutes.js
// 1. What this file does:
//    Defines the web addresses (routes) for dashboard statistics (/stats),
//    urgent deadlines (/upcoming), and testing reminder emails (/trigger-reminders).
// 2. Why this file exists:
//    Separates chart and summary data requests from normal purchase list routes.
// 3. Important points to remember:
//    - router.use(protect): Makes sure users only get calculations for their own items.
//    - /stats: Gives the frontend spending totals and monthly/category chart numbers.
//    - /upcoming: Gives the frontend a list of deadlines ending soon.
// 4. How it connects to other parts:
//    - Mounted at '/api/dashboard' inside 'server.js'.
//    - Passes work to 'controllers/dashboardController.js'.
// ============================================================================

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUpcomingDeadlines,
  triggerRemindersManually
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/upcoming', getUpcomingDeadlines);
router.post('/trigger-reminders', triggerRemindersManually);

module.exports = router;
