// ============================================================================
// File: server/utils/dateCalculations.js
// 1. What this file does:
//    Calculates how many days are left until a warranty expires or a return window closes,
//    and gives back simple status labels (like "Active", "Expiring Soon", or "Expired").
// 2. Why this file exists:
//    Time moves forward every day! If we saved "10 days left" in the database, it would
//    become wrong tomorrow. Calculating it live on every request ensures it is always accurate.
// 3. Important points to remember:
//    - calculateDaysRemaining(targetDate): Compares today with the target date.
//    - getReturnStatus: Returns 'open', 'approaching' (<=7 days), or 'closed'.
//    - getWarrantyStatus: Returns 'active', 'expiring_soon' (<=30 days), or 'expired'.
//    - attachDynamicStatus: Adds these calculated statuses directly to purchase objects.
// 4. How it connects to other parts:
//    - Used by 'controllers/purchaseController.js', 'controllers/dashboardController.js',
//      and 'jobs/reminderJob.js'.
// ============================================================================

/**
 * Calculates whole days remaining between current date and target date.
 * Uses UTC date boundaries to avoid timezone/daylight-savings offset anomalies.
 * @param {Date|string|null} targetDate
 * @returns {number|null} Days remaining, or null if no date provided
 */
const calculateDaysRemaining = (targetDate) => {
  if (!targetDate) return null;

  const now = new Date();
  const target = new Date(targetDate);

  if (isNaN(target.getTime())) return null;

  // Normalize both dates to midnight local time for fair day comparisons
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Determines return window status and human-readable label.
 * @param {Date|string|null} returnDeadline
 * @returns {object} { status, daysRemaining, label }
 */
const getReturnStatus = (returnDeadline) => {
  const days = calculateDaysRemaining(returnDeadline);

  if (days === null) {
    return {
      status: 'not_set',
      daysRemaining: null,
      label: 'No return deadline'
    };
  }

  if (days < 0) {
    return {
      status: 'closed',
      daysRemaining: days,
      label: 'Return window closed'
    };
  }

  if (days <= 3) {
    return {
      status: 'approaching',
      daysRemaining: days,
      label: days === 0 ? 'Return deadline today' : `Return deadline approaching (${days}d left)`
    };
  }

  return {
    status: 'open',
    daysRemaining: days,
    label: `Return window open (${days}d left)`
  };
};

/**
 * Determines warranty validity status and human-readable label.
 * @param {Date|string|null} warrantyEndDate
 * @returns {object} { status, daysRemaining, label }
 */
const getWarrantyStatus = (warrantyEndDate) => {
  const days = calculateDaysRemaining(warrantyEndDate);

  if (days === null) {
    return {
      status: 'not_set',
      daysRemaining: null,
      label: 'No warranty specified'
    };
  }

  if (days < 0) {
    return {
      status: 'expired',
      daysRemaining: days,
      label: 'Warranty expired'
    };
  }

  if (days <= 30) {
    return {
      status: 'expiring_soon',
      daysRemaining: days,
      label: days === 0 ? 'Warranty expires today' : `Warranty expiring soon (${days}d left)`
    };
  }

  return {
    status: 'active',
    daysRemaining: days,
    label: `Warranty active (${days}d left)`
  };
};

/**
 * Enriches a Mongoose document or plain purchase object with real-time dynamic properties.
 * @param {object} purchase
 * @returns {object}
 */
const attachDynamicStatus = (purchase) => {
  const raw = typeof purchase.toObject === 'function' ? purchase.toObject() : { ...purchase };

  const returnStatus = getReturnStatus(raw.returnDeadline);
  const warrantyStatus = getWarrantyStatus(raw.warrantyEndDate);

  return {
    ...raw,
    returnStatus,
    warrantyStatus
  };
};

module.exports = {
  calculateDaysRemaining,
  getReturnStatus,
  getWarrantyStatus,
  attachDynamicStatus
};
