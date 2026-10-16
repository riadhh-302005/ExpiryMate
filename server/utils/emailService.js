// ============================================================================
// File: server/utils/emailService.js
// 1. What this file does:
//    Sends email notifications to users using Nodemailer when their return deadlines
//    or warranties are expiring soon.
// 2. Why this file exists:
//    Keeps all email templates and sending logic in one place, away from database code.
// 3. Important points to remember:
//    - If Gmail credentials are in .env, sends real HTML emails to the user's inbox.
//    - If credentials are not set, it runs in "Dev Simulation Mode" and prints the
//      email preview to the terminal so developers can test without setup.
//    - sendReturnDeadlineReminder: Formats and sends a return alert.
//    - sendWarrantyExpiryReminder: Formats and sends a warranty alert.
// 4. How it connects to other parts:
//    - Called by 'jobs/reminderJob.js' (the daily reminder check).
// ============================================================================

const nodemailer = require('nodemailer');

const isEmailConfigured = () => {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
};

// Create Nodemailer transporter if credentials are present
let transporter = null;
if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

/**
 * Sends an email or prints to console in development mode.
 * @param {object} mailOptions { to, subject, html }
 * @returns {Promise<object>} Result status
 */
const sendMail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || '"ExpiryMate Reminders" <no-reply@expirymate.local>';

  if (!isEmailConfigured() || !transporter) {
    console.log('\n======================================================');
    console.log(' [EMAIL SIMULATION - DEV MODE (No SMTP credentials)]');
    console.log(` To:      ${to}`);
    console.log(` From:    ${from}`);
    console.log(` Subject: ${subject}`);
    console.log(' Body preview: (HTML email simulated successfully)');
    console.log('======================================================\n');
    return { success: true, mode: 'simulated_dev' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
    console.log(`[Email] Successfully delivered email to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, mode: 'smtp_live' };
  } catch (error) {
    console.error(`[Email] Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Sends an alert when a return window is closing soon.
 */
const sendReturnDeadlineReminder = async (user, purchase, daysRemaining) => {
  const daysText = daysRemaining === 0 ? 'TODAY' : `in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`;
  const subject = `⚠️ Action Required: Return window for "${purchase.productName}" closes ${daysText}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1e293b; margin-top: 0;">ExpiryMate Return Window Reminder</h2>
      <p style="color: #475569; font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
      <p style="color: #475569; font-size: 16px;">
        This is an automated reminder that the return window for your purchase is ending soon:
      </p>

      <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 4px 0; color: #1e293b;"><strong>Product:</strong> ${purchase.productName}</p>
        <p style="margin: 4px 0; color: #1e293b;"><strong>Seller/Store:</strong> ${purchase.seller || 'N/A'}</p>
        <p style="margin: 4px 0; color: #1e293b;"><strong>Price:</strong> ₹${purchase.price.toLocaleString('en-IN')}</p>
        <p style="margin: 4px 0; color: #dc2626;"><strong>Return Deadline:</strong> ${new Date(purchase.returnDeadline).toLocaleDateString()} (${daysText})</p>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        If you plan to return or exchange this item, please make sure to initiate the process before the deadline.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
        You received this because you saved this item in your ExpiryMate tracker.
      </p>
    </div>
  `;

  return sendMail({ to: user.email, subject, html });
};

/**
 * Sends an alert when a manufacturer warranty is expiring soon.
 */
const sendWarrantyExpiryReminder = async (user, purchase, daysRemaining) => {
  const daysText = daysRemaining === 0 ? 'TODAY' : `in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`;
  const subject = `🛡️ Expiry Alert: Warranty for "${purchase.productName}" expires ${daysText}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1e293b; margin-top: 0;">ExpiryMate Warranty Reminder</h2>
      <p style="color: #475569; font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
      <p style="color: #475569; font-size: 16px;">
        Your manufacturer warranty for the following item is about to expire:
      </p>

      <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 4px 0; color: #1e293b;"><strong>Product:</strong> ${purchase.productName}</p>
        <p style="margin: 4px 0; color: #1e293b;"><strong>Seller/Store:</strong> ${purchase.seller || 'N/A'}</p>
        <p style="margin: 4px 0; color: #1e293b;"><strong>Category:</strong> ${purchase.category}</p>
        <p style="margin: 4px 0; color: #4338ca;"><strong>Warranty Expiration Date:</strong> ${new Date(purchase.warrantyEndDate).toLocaleDateString()} (${daysText})</p>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        If you are experiencing any hardware defects or malfunctions, submit your warranty claim before coverage ends.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
        You received this because you registered this warranty in your ExpiryMate tracker.
      </p>
    </div>
  `;

  return sendMail({ to: user.email, subject, html });
};

module.exports = {
  sendReturnDeadlineReminder,
  sendWarrantyExpiryReminder,
  isEmailConfigured
};
