// ============================================================================
// File: client/src/utils/formatters.js
// 1. What this file does:
//    Contains helper functions for text and numbers: formatting prices in Indian
//    Rupees (₹) and shortening long text so it doesn't break the layout.
// 2. Why this file exists:
//    Makes sure all prices look neat and consistent (e.g. ₹12,499.00) everywhere in the app.
// 3. Important points to remember:
//    - formatCurrency: Formats any number into Indian Rupees using the 'en-IN' standard.
//    - truncateText: Cuts off long product names or notes with "..." if they are too long.
// 4. How it connects to other parts:
//    - Used across cards, charts, and summary pages to show prices cleanly.
// ============================================================================

/**
 * Formats a numeric value into Indian Rupee currency format (₹12,499.00).
 * Uses 'en-IN' locale with INR currency code for proper Lakh/Crore grouping.
 * @param {number|string} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Truncates text exceeding max length and appends ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 40) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Capitalizes first letter of a word.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
