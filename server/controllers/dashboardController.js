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
//      immediately from the Profile page without waiting for the daily cron timer.
// 4. How it connects to other parts:
//    - Called by 'routes/dashboardRoutes.js'.
//    - Fetches data from 'models/Purchase.js'.
// ============================================================================

const Purchase = require('../models/Purchase');
const { attachDynamicStatus, calculateDaysRemaining } = require('../utils/dateCalculations');
const { checkAndSendReminders } = require('../jobs/reminderJob');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard metrics, charts data, and recent items for the logged-in user
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all user purchases
    const purchases = await Purchase.find({ user: userId }).sort({ purchaseDate: -1 });

    const totalPurchases = purchases.length;
    let totalSpending = 0;
    let activeWarranties = 0;
    let expiringWarranties = 0;
    let upcomingReturns = 0;

    const categoryMap = {};
    const monthlyMap = {};

    // Generate month keys for last 6 months so charts show a complete timeline
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[monthKey] = 0;
    }

    purchases.forEach((p) => {
      totalSpending += p.price;

      // Category breakdown
      categoryMap[p.category] = (categoryMap[p.category] || 0) + p.price;

      // Monthly spending breakdown
      const pDate = new Date(p.purchaseDate);
      const monthKey = pDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyMap[monthKey] !== undefined) {
        monthlyMap[monthKey] += p.price;
      }

      // Dynamic deadline checks
      const returnDays = calculateDaysRemaining(p.returnDeadline);
      if (returnDays !== null && returnDays >= 0 && returnDays <= 7) {
        upcomingReturns += 1;
      }

      const warrantyDays = calculateDaysRemaining(p.warrantyEndDate);
      if (warrantyDays !== null) {
        if (warrantyDays >= 0) {
          activeWarranties += 1;
        }
        if (warrantyDays >= 0 && warrantyDays <= 30) {
          expiringWarranties += 1;
        }
      }
    });

    // Format category spending for Recharts
    const categorySpending = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: Math.round(categoryMap[cat] * 100) / 100
    }));

    // Format monthly spending for Recharts
    const monthlySpending = Object.keys(monthlyMap).map((m) => ({
      month: m,
      amount: Math.round(monthlyMap[m] * 100) / 100
    }));

    // Get 5 most recent purchases with dynamic status
    const recentPurchases = purchases.slice(0, 5).map((p) => attachDynamicStatus(p));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPurchases,
          totalSpending: Math.round(totalSpending * 100) / 100,
          activeWarranties,
          expiringWarranties,
          upcomingReturns
        },
        categorySpending,
        monthlySpending,
        recentPurchases
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/upcoming
 * @desc    Get organized list of upcoming return deadlines and warranty expirations
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

      // Return deadlines within next 14 days and not closed
      if (
        enriched.returnStatus.status === 'open' ||
        enriched.returnStatus.status === 'approaching'
      ) {
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
    res.status(200).json({
      success: true,
      message: 'Reminder check executed successfully.',
      result
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
