// ============================================================================
// File: client/src/utils/dateUtils.js
// 1. What this file does:
//    Contains helper functions for dates: turning computer dates into friendly text
//    (like "Oct 12, 2026") and calculating how many days are left.
// 2. Why this file exists:
//    Formatting dates by hand on every page leads to bugs. This helper keeps all
//    date formatting clean, consistent, and in one place.
// 3. Important points to remember:
//    - formatDate: Turns a date into readable text like "Oct 12, 2026".
//    - formatInputDate: Turns a date into "YYYY-MM-DD" so date inputs can display it.
//    - formatRelativeDays: Turns day numbers into friendly text like "in 3 days" or "expired 2 days ago".
// 4. How it connects to other parts:
//    - Used across cards, forms, and deadline pages to display dates nicely.
// ============================================================================

/**
 * Formats a Date/string into a user-friendly format (e.g., "Oct 12, 2026").
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return 'Not set';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
};

/**
 * Converts a Date or ISO string into "YYYY-MM-DD" for HTML5 date input values.
 * @param {Date|string} date
 * @returns {string}
 */
export const formatInputDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Calculates remaining calendar days between today and target date.
 * @param {Date|string} targetDate
 * @returns {number|null}
 */
export const getDaysRemaining = (targetDate) => {
  if (!targetDate) return null;

  const now = new Date();
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return null;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Formats a days remaining number into an informative label.
 * @param {number|null} days
 * @returns {string}
 */
export const formatRelativeDays = (days) => {
  if (days === null || days === undefined) return 'No deadline';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days} days`;
};
