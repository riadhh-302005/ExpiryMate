// ============================================================================
// File: server/jobs/reminderJob.js
// 1. What this file does:
//    Runs a daily background check (using node-cron) to find items with return
//    deadlines ending within 3 days or warranties expiring within 30 days, and sends alert emails.
// 2. Why this file exists:
//    Users shouldn't have to check the app manually every day. This automated job
//    proactively reminds them so they never lose money or miss free warranty repairs.
// 3. Important points to remember:
//    - initReminderJob(): Schedules the task to run automatically every morning at 8:00 AM.
//    - checkAndSendReminders(): Finds matching items in MongoDB and sends emails.
//    - Prevents duplicate spam: Marks 'remindersSent: true' after sending so users
//      only get notified once per deadline.
// 4. How it connects to other parts:
//    - Started by 'server.js' when the server boots.
//    - Uses 'utils/emailService.js' to deliver the emails.
// ============================================================================

const cron = require('node-cron');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const { calculateDaysRemaining } = require('../utils/dateCalculations');
const {
  sendReturnDeadlineReminder,
  sendWarrantyExpiryReminder
} = require('../utils/emailService');

/**
 * Scans the database and sends reminder emails for imminent deadlines.
 * Avoids duplicate emails by checking remindersSent flags.
 * @returns {Promise<{ returnRemindersSent: number, warrantyRemindersSent: number }>}
 */
const checkAndSendReminders = async () => {
  console.log('[ReminderJob] Starting scheduled check for upcoming deadlines...');

  let returnRemindersSent = 0;
  let warrantyRemindersSent = 0;

  try {
    const now = new Date();

    // 1. Check for upcoming return deadlines (0 to 3 days remaining)
    // Query only items with an existing return deadline where return reminder hasn't been sent yet
    const pendingReturns = await Purchase.find({
      returnDeadline: { $ne: null },
      'remindersSent.returnDeadline': false
    }).populate('user', 'name email');

    for (const purchase of pendingReturns) {
      if (!purchase.user || !purchase.user.email) continue;

      const daysLeft = calculateDaysRemaining(purchase.returnDeadline);

      // Trigger reminder if deadline is between 0 and 3 days from now
      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 3) {
        console.log(
          `[ReminderJob] Sending return deadline reminder for "${purchase.productName}" to ${purchase.user.email} (${daysLeft}d left)`
        );

        await sendReturnDeadlineReminder(purchase.user, purchase, daysLeft);

        // Mark flag to prevent duplicate reminder
        purchase.remindersSent.returnDeadline = true;
        await purchase.save();
        returnRemindersSent++;
      }
    }

    // 2. Check for upcoming warranty expirations (0 to 30 days remaining)
    // Query only items with an existing warranty where warranty reminder hasn't been sent yet
    const pendingWarranties = await Purchase.find({
      warrantyEndDate: { $ne: null },
      'remindersSent.warrantyExpiry': false
    }).populate('user', 'name email');

    for (const purchase of pendingWarranties) {
      if (!purchase.user || !purchase.user.email) continue;

      const daysLeft = calculateDaysRemaining(purchase.warrantyEndDate);

      // Trigger reminder if warranty expires within 30 days
      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 30) {
        console.log(
          `[ReminderJob] Sending warranty expiry reminder for "${purchase.productName}" to ${purchase.user.email} (${daysLeft}d left)`
        );

        await sendWarrantyExpiryReminder(purchase.user, purchase, daysLeft);

        // Mark flag to prevent duplicate reminder
        purchase.remindersSent.warrantyExpiry = true;
        await purchase.save();
        warrantyRemindersSent++;
      }
    }

    console.log(
      `[ReminderJob] Completed check. Sent: ${returnRemindersSent} return alert(s), ${warrantyRemindersSent} warranty alert(s).`
    );

    return {
      success: true,
      returnRemindersSent,
      warrantyRemindersSent
    };
  } catch (error) {
    console.error(`[ReminderJob] Error executing reminder job: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Initializes the node-cron scheduler.
 * Defaults to running every day at 08:00 AM (0 8 * * *).
 */
const initReminderJob = () => {
  const schedule = process.env.REMINDER_CRON_SCHEDULE || '0 8 * * *';

  cron.schedule(schedule, async () => {
    console.log(`[ReminderJob] Cron triggered at ${new Date().toISOString()}`);
    await checkAndSendReminders();
  });

  console.log(`[ReminderJob] Cron scheduler active with pattern: "${schedule}" (Runs daily at 08:00 AM)`);
};

module.exports = {
  initReminderJob,
  checkAndSendReminders
};
