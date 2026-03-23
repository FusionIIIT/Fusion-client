/**
 * Input Validators
 * Validation functions for form inputs
 */

/**
 * Validate phone number (10 digits)
 */
export const validatePhone = (value) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) {
    return "Phone number must contain exactly 10 digits";
  }
  return null;
};

/**
 * Validate email format
 */
export const validateEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Please enter a valid email address";
  }
  return null;
};

/**
 * Validate that value is not empty
 */
export const validateRequired = (value, fieldName = "This field") => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate date range (start must be before end)
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return null;
  }
  if (new Date(startDate) > new Date(endDate)) {
    return "Start date must be before end date";
  }
  return null;
};

/**
 * Validate numeric range
 */
export const validateNumericRange = (value, min, max, fieldName = "Value") => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

/**
 * Validate that value is a positive number
 */
export const validatePositiveNumber = (value, fieldName = "Value") => {
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength, fieldName = "Value") => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength, fieldName = "Value") => {
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate against pattern (regex)
 */
export const validatePattern = (value, pattern, message = "Invalid format") => {
  if (!pattern.test(value)) {
    return message;
  }
  return null;
};

/**
 * STRING SANITIZERS
 * Prevent XSS and other attacks
 */

/**
 * Escape HTML characters to prevent XSS
 */
export const sanitizeHtml = (value) => {
  if (typeof value !== "string") return value;
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
};

/**
 * Remove potentially dangerous characters
 */
export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  // Remove any HTML tags and dangerous characters
  return value
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>"'%&]/g, ""); // Remove special characters
};

/**
 * Trim whitespace and normalize spaces
 */
export const normalizeString = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/\s+/g, " "); // Replace multiple spaces with single space
};

/**
 * Validate and sanitize all user inputs
 */
export const validateAndSanitize = (value, validators = []) => {
  const error =
    validators
      .map((validator) => validator(value))
      .find((validationError) => Boolean(validationError)) || null;

  // Sanitize value
  const sanitized = sanitizeString(value);

  return { error, sanitized };
};
