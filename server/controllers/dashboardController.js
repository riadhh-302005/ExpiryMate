// ============================================================================
// File: server/controllers/dashboardController.js
// 1. What this file does:
//    Calculates the dashboard summary numbers: total money spent, active warranties,
//    expiring items, monthly spending trends, and category chart data.
// 2. Why this file exists:
//    It does all the math on the server so the React frontend can quickly
//    render clean cards and charts for the logged-in user.
// 3. Important points to remember:
//    - getDashboardStats: Adds up spending and groups purchases by month and category.
//    - getUpcomingDeadlines: Finds returns ending in <= 14 days and warranties in <= 60 days.
//    - triggerRemindersManually: Lets users or testers trigger the reminder check
//      immediately from the Profile page, sending real alert or verification emails.
// 4. How it connects to other parts:
//    - Called by 'routes/dashboardRoutes.js'.
//    - Fetches data from 'models/Purchase.js'.
// ============================================================================

const Purchase = require('../models/Purchase');
const { attachDynamicStatus, calculateDaysRemaining } = require('../utils/dateCalculations');
const { checkAndSendReminders } = require('../jobs/reminderJob');
const { sendTestVerificationEmail } = require('../utils/emailService');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard metrics, charts data, and recent items for the logged-in user
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all user purchases sorted by purchaseDate descending
    const purchases = await Purchase.find({ user: userId }).sort({ purchaseDate: -1 });

    let totalSpend = 0;
    let activeWarranties = 0;
    let expiringSoonCount = 0; // <= 30 days
    let upcomingReturnsCount = 0; // <= 7 days

    const categoryMap = {};
    const monthlyMap = {};

    // Initialize 6 past calendar months with 0 amount
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[key] = 0;
    }

    purchases.forEach((p) => {
      totalSpend += p.price || 0;

      const enriched = attachDynamicStatus(p);

      // Count active and expiring warranties
      if (
        enriched.warrantyStatus.status === 'active' ||
        enriched.warrantyStatus.status === 'expiring_soon'
      ) {
        activeWarranties++;
        if (enriched.warrantyStatus.status === 'expiring_soon') {
          expiringSoonCount++;
        }
      }

      // Count return windows closing soon (<= 7 days and open)
      if (
        enriched.returnStatus.status === 'approaching' ||
        (enriched.returnStatus.status === 'open' &&
          enriched.returnStatus.daysRemaining !== null &&
          enriched.returnStatus.daysRemaining <= 7)
      ) {
        upcomingReturnsCount++;
      }

      // Aggregate category spending
      const cat = p.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + (p.price || 0);

      // Aggregate monthly spending (using purchaseDate)
      const pDate = new Date(p.purchaseDate);
      const monthKey = pDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyMap[monthKey] !== undefined) {
        monthlyMap[monthKey] += p.price || 0;
      }
    });

    // Format monthly trend array for Recharts
    const monthlySpending = Object.keys(monthlyMap).map((month) => ({
      month,
      amount: Math.round(monthlyMap[month])
    }));

    // Format category spending array for Recharts
    const categorySpending = Object.keys(categoryMap).map((category) => ({
      category,
      amount: Math.round(categoryMap[category])
    }));

    // Take top 6 most recent purchases with dynamic statuses
    const recentPurchases = purchases.slice(0, 6).map((p) => attachDynamicStatus(p));

    const summary = {
      totalSpending: totalSpend,
      totalSpend,
      totalItems: purchases.length,
      totalPurchases: purchases.length,
      activeWarranties,
      upcomingReturns: upcomingReturnsCount,
      upcomingReturnsCount,
      expiringWarranties: expiringSoonCount,
      expiringSoonCount
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        totalSpend,
        totalSpending: totalSpend,
        totalPurchases: purchases.length,
        totalItems: purchases.length,
        activeWarranties,
        expiringSoonCount,
        expiringWarranties: expiringSoonCount,
        upcomingReturnsCount,
        upcomingReturns: upcomingReturnsCount,
        monthlySpending,
        categorySpending,
        recentPurchases
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/upcoming
 * @desc    Get upcoming deadlines prioritized by days remaining
 * @access  Private
 */
const getUpcomingDeadlines = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const purchases = await Purchase.find({ user: userId });

    const returnDeadlines = [];
    const warrantyExpirations = [];

    purchases.forEach((p) => {
      const enriched = attachDynamicStatus(p);

      // Returns ending within next 14 days and not yet closed
      if (enriched.returnStatus.status === 'open' || enriched.returnStatus.status === 'approaching') {
        if (enriched.returnStatus.daysRemaining !== null && enriched.returnStatus.daysRemaining <= 14) {
          returnDeadlines.push(enriched);
        }
      }

      // Warranties expiring within next 60 days and not yet expired
      if (
        enriched.warrantyStatus.status === 'active' ||
        enriched.warrantyStatus.status === 'expiring_soon'
      ) {
        if (enriched.warrantyStatus.daysRemaining !== null && enriched.warrantyStatus.daysRemaining <= 60) {
          warrantyExpirations.push(enriched);
        }
      }
    });

    // Sort by most urgent days remaining
    returnDeadlines.sort((a, b) => a.returnStatus.daysRemaining - b.returnStatus.daysRemaining);
    warrantyExpirations.sort((a, b) => a.warrantyStatus.daysRemaining - b.warrantyStatus.daysRemaining);

    res.status(200).json({
      success: true,
      data: {
        returnDeadlines,
        warrantyExpirations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/dashboard/trigger-reminders
 * @desc    Manually triggers email reminder check on demand (useful for testing and demo)
 * @access  Private
 */
const triggerRemindersManually = async (req, res, next) => {
  try {
    const result = await checkAndSendReminders();

    // If an SMTP authentication or delivery error occurred during the scan, report it
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: `Email delivery error: ${result.error}. Please check your Google App Password in .env.`
      });
    }

    let testEmailSent = false;

    // If no purchases were in the alert window (<=3d return, <=30d warranty), send a test verification email to confirm delivery!
    if (result.returnRemindersSent === 0 && result.warrantyRemindersSent === 0) {
      if (req.user && req.user.email) {
        const verifyRes = await sendTestVerificationEmail(req.user);
        if (!verifyRes.success) {
          return res.status(400).json({
            success: false,
            message: `Email delivery failed: ${verifyRes.error || 'SMTP rejected credentials'}. Please verify your Google App Password.`
          });
        }
        testEmailSent = true;
      }
    }

    res.status(200).json({
      success: true,
      message: testEmailSent
        ? `No items were in the alert window, so a test verification email was delivered to ${req.user.email}!`
        : 'Reminder check executed successfully.',
      result: {
        ...result,
        testEmailSent
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUpcomingDeadlines,
  triggerRemindersManually
};
