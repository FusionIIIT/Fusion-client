/**
 * Health Center Helper Utilities
 * Common utility functions used across the module
 */

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format time to readable string
 */
export const formatTime = (time) => {
  if (!time) return "";
  return new Date(`2000-01-01 ${time}`).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return "";
  const d = new Date(datetime);
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get day name from number (0-6)
 */
export const getDayName = (dayNumber) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return days[dayNumber] || "";
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, length = 50) => {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  );
};

/**
 * Capitalize first letter of string
 */
export const capitalizeFirstLetter = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convert API response field names to readable labels
 */
export const fieldNameToLabel = (fieldName) => {
  return fieldName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
};

/**
 * Check if value is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if value is valid phone
 */
export const isValidPhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10;
};

/**
 * Delay function for async operations
 */
export const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get nested object value safely
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  const keys = path.split(".");
  const value = keys.reduce((accumulator, key) => {
    if (accumulator && typeof accumulator === "object" && key in accumulator) {
      return accumulator[key];
    }
    return undefined;
  }, obj);

  return value === undefined ? defaultValue : value;
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
  return Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join("&");
};
