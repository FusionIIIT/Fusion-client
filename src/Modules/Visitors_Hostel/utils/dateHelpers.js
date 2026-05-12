/**
 * Date Helper Functions
 * Reusable date formatting and manipulation utilities
 */

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

/**
 * Format date to readable format (e.g., "Jan 15, 2025")
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateReadable = (date) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
};

/**
 * Format date with time
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  const d = new Date(date);
  const dateStr = formatDate(d);
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr} ${time}`;
};

/**
 * Get number of days between two dates
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {number}
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is in the past
 * @param {string} date - YYYY-MM-DD
 * @returns {boolean}
 */
export const isDateInPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is today
 * @param {string} date - YYYY-MM-DD
 * @returns {boolean}
 */
export const isDateToday = (date) => {
  const today = formatDate(new Date());
  return formatDate(date) === today;
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string}
 */
export const getTodayDate = () => {
  return formatDate(new Date());
};

/**
 * Add days to a date
 * @param {string} date - YYYY-MM-DD
 * @param {number} days
 * @returns {string}
 */
export const addDaysToDate = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};
