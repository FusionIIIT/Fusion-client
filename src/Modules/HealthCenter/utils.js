/**
 * Health Center Module Utilities
 * ===============================
 * 
 * Shared utility functions used across all pages
 * Includes formatting, validation, and helper functions
 */

import {
  STATUS_CONFIG,
  VALIDATION_RULES,
  DATE_TIME_CONFIG,
  ROLE_CONFIG,
} from './config';

// ============================================================================
// DATE AND TIME UTILITIES
// ============================================================================

/**
 * Format date to YYYY-MM-DD
 * @param {Date | string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * Format time to HH:MM
 * @param {string} time - Time string (HH:MM:SS format)
 * @returns {string} Formatted time (HH:MM)
 */
export function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

/**
 * Format date for display (e.g., "Jan 15, 2024")
 * @param {Date | string} date - Date to format
 * @returns {string} Display formatted date
 */
export function formatDateForDisplay(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if date is in the past
 * @param {string | Date} date - Date to check
 * @returns {boolean} True if date is in past
 */
export function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Check if date is within N days (for expiry warnings)
 * @param {string} expiryDate - Expiry date
 * @param {number} days - Number of days to check within
 * @returns {boolean} True if expiring within N days
 */
export function isExpiringWithin(expiryDate, days = 30) {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.floor(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= days && daysUntilExpiry >= 0;
}

/**
 * Check if date is expired
 * @param {string} expiryDate - Expiry date
 * @returns {boolean} True if expired
 */
export function isExpired(expiryDate) {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  return expiry < today;
}

/**
 * Get days until expiry
 * @param {string} expiryDate - Expiry date
 * @returns {number} Number of days until expiry (-1 if expired)
 */
export function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const days = Math.floor(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );
  return days;
}

// ============================================================================
// STATUS AND BADGE UTILITIES
// ============================================================================

/**
 * Get badge color for claim status
 * @param {string} status - Claim status
 * @returns {string} Badge color
 */
export function getClaimStatusColor(status) {
  const config = STATUS_CONFIG.CLAIM_STATUS[status];
  return config ? config.color : 'gray';
}

/**
 * Get label for claim status
 * @param {string} status - Claim status
 * @returns {string} Status label
 */
export function getClaimStatusLabel(status) {
  const config = STATUS_CONFIG.CLAIM_STATUS[status];
  return config ? config.label : status;
}

/**
 * Get badge color for appointment status
 * @param {string} status - Appointment status
 * @returns {string} Badge color
 */
export function getAppointmentStatusColor(status) {
  const config = STATUS_CONFIG.APPOINTMENT_STATUS[status];
  return config ? config.color : 'gray';
}

/**
 * Get badge color for doctor availability status
 * @param {string} status - Doctor status
 * @returns {string} Badge color
 */
export function getDoctorStatusColor(status) {
  const config = STATUS_CONFIG.DOCTOR_STATUS[status];
  return config ? config.color : 'gray';
}

/**
 * Get badge color for stock status
 * @param {number} currentStock - Current stock quantity
 * @param {number} threshold - Reorder threshold
 * @returns {string} Badge color
 */
export function getStockStatusColor(currentStock, threshold) {
  if (currentStock === 0) return 'red'; // Out of stock
  if (currentStock < threshold) return 'yellow'; // Low stock
  return 'green'; // In stock
}

/**
 * Get stock level label
 * @param {number} currentStock - Current stock quantity
 * @param {number} threshold - Reorder threshold
 * @returns {string} Stock label
 */
export function getStockStatusLabel(currentStock, threshold) {
  if (currentStock === 0) return 'Out of Stock';
  if (currentStock < threshold) return 'Low Stock';
  return 'In Stock';
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate claim amount
 * @param {number} amount - Claim amount
 * @returns {object} Validation result {valid, error}
 */
export function validateClaimAmount(amount) {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount < VALIDATION_RULES.CLAIM.MIN_AMOUNT) {
    return {
      valid: false,
      error: `Minimum claim amount is ₹${VALIDATION_RULES.CLAIM.MIN_AMOUNT}`,
    };
  }
  if (amount > VALIDATION_RULES.CLAIM.MAX_AMOUNT) {
    return {
      valid: false,
      error: `Maximum claim amount is ₹${VALIDATION_RULES.CLAIM.MAX_AMOUNT}`,
    };
  }
  return { valid: true };
}

/**
 * Validate claim submission date (within 30 days)
 * @param {string} expenseDate - Expense date
 * @returns {object} Validation result {valid, error}
 */
export function validateClaimDate(expenseDate) {
  if (!expenseDate) {
    return { valid: false, error: 'Please select an expense date' };
  }

  const expenseTime = new Date(expenseDate).getTime();
  const nowTime = new Date().getTime();
  const daysDiff = Math.floor((nowTime - expenseTime) / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return { valid: false, error: 'Expense date cannot be in the future' };
  }

  if (daysDiff > VALIDATION_RULES.CLAIM.MAX_SUBMISSION_DAYS) {
    return {
      valid: false,
      error: `Claims must be submitted within ${VALIDATION_RULES.CLAIM.MAX_SUBMISSION_DAYS} days of expense`,
    };
  }

  return { valid: true };
}

/**
 * Validate appointment date
 * @param {Date} appointmentDate - Appointment date
 * @returns {object} Validation result {valid, error}
 */
export function validateAppointmentDate(appointmentDate) {
  if (!appointmentDate) {
    return { valid: false, error: 'Please select an appointment date' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const apptDate = new Date(appointmentDate);
  apptDate.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + VALIDATION_RULES.APPOINTMENT.MIN_DAYS_IN_ADVANCE);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + VALIDATION_RULES.APPOINTMENT.MAX_DAYS_IN_ADVANCE);

  if (apptDate < minDate) {
    return {
      valid: false,
      error: `Appointments can be booked ${VALIDATION_RULES.APPOINTMENT.MIN_DAYS_IN_ADVANCE} day(s) in advance`,
    };
  }

  if (apptDate > maxDate) {
    return {
      valid: false,
      error: `Appointments can only be booked up to ${VALIDATION_RULES.APPOINTMENT.MAX_DAYS_IN_ADVANCE} days in advance`,
    };
  }

  return { valid: true };
}

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @returns {object} Validation result {valid, error}
 */
export function validateFileUpload(file) {
  if (!file) {
    return { valid: false, error: 'Please select a file' };
  }

  const maxSizeBytes = VALIDATION_RULES.DOCUMENT.MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${VALIDATION_RULES.DOCUMENT.MAX_FILE_SIZE_MB}MB`,
    };
  }

  if (!VALIDATION_RULES.DOCUMENT.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${VALIDATION_RULES.DOCUMENT.ALLOWED_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Check if user role can access feature
 * @param {string} userRole - User's role
 * @param {string} requiredPermission - Required permission
 * @returns {boolean} Can access feature
 */
export function canAccessFeature(userRole, requiredPermission) {
  const permissions = ROLE_CONFIG.ROLE_FEATURES[userRole] || [];
  return (
    permissions.includes(requiredPermission) ||
    permissions.includes('all_features')
  );
}

/**
 * Check if user can book appointments
 * @param {string} userRole - User's role
 * @returns {boolean} Can book
 */
export function canBookAppointment(userRole) {
  return canAccessFeature(userRole, 'book_appointment');
}

/**
 * Check if user can submit claims
 * @param {string} userRole - User's role
 * @returns {boolean} Can submit
 */
export function canSubmitClaim(userRole) {
  return canAccessFeature(userRole, 'submit_claim');
}

/**
 * Check if user can process claims
 * @param {string} userRole - User's role
 * @returns {boolean} Can process
 */
export function canProcessClaim(userRole) {
  return canAccessFeature(userRole, 'process_claims');
}

/**
 * Check if user can manage inventory
 * @param {string} userRole - User's role
 * @returns {boolean} Can manage
 */
export function canManageInventory(userRole) {
  return canAccessFeature(userRole, 'manage_inventory');
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format currency (Indian Rupees)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0';
  return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  if (!value && value !== 0) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviation
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 50) {
  if (!text || text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

// ============================================================================
// WORKFLOW UTILITIES
// ============================================================================

/**
 * Get workflow stage number from claim status
 * @param {string} status - Claim status
 * @returns {number} Stage number
 */
export function getClaimWorkflowStage(status) {
  const config = STATUS_CONFIG.CLAIM_STATUS[status];
  return config ? config.stage : 0;
}

/**
 * Get next workflow stage
 * @param {string} currentStatus - Current claim status
 * @returns {string} Next status (if approved)
 */
export function getNextClaimStatus(currentStatus) {
  const stageMap = {
    SUBMITTED: 'ACCOUNTS_VERIFICATION',
    ACCOUNTS_VERIFICATION: 'SANCTION_REVIEW',
    SANCTION_REVIEW: 'FINAL_PAYMENT',
    FINAL_PAYMENT: 'REIMBURSED',
  };
  return stageMap[currentStatus] || currentStatus;
}

/**
 * Get workflow progress percentage
 * @param {string} status - Claim status
 * @returns {number} Progress 0-100
 */
export function getClaimWorkflowProgress(status) {
  const stage = getClaimWorkflowStage(status);
  const totalStages = 5;
  return status === 'REJECTED' ? 0 : (stage / totalStages) * 100;
}

// ============================================================================
// COMMON CALCULATIONS
// ============================================================================

/**
 * Calculate days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days
 */
export function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate age from date of birth
 * @param {string | Date} dob - Date of birth
 * @returns {number} Age in years
 */
export function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate average of numbers
 * @param {array} numbers - Array of numbers
 * @returns {number} Average
 */
export function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Extract error message from API response
 * @param {object} error - Axios error object
 * @returns {string} Error message
 */
export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  // Axios error
  if (error.response) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }

  // Network error
  if (error.message) return error.message;

  return 'An unknown error occurred';
}

/**
 * Format error for display
 * @param {object} error - Error object
 * @returns {object} Formatted error {title, message}
 */
export function formatError(error) {
  const message = getErrorMessage(error);
  return {
    title: 'Error',
    message: truncateText(message, 200),
  };
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export default {
  // Date utilities
  formatDate,
  formatTime,
  formatDateForDisplay,
  isPastDate,
  isExpiringWithin,
  isExpired,
  daysUntilExpiry,

  // Status utilities
  getClaimStatusColor,
  getClaimStatusLabel,
  getAppointmentStatusColor,
  getDoctorStatusColor,
  getStockStatusColor,
  getStockStatusLabel,

  // Validation utilities
  validateClaimAmount,
  validateClaimDate,
  validateAppointmentDate,
  validateFileUpload,

  // Permission utilities
  canAccessFeature,
  canBookAppointment,
  canSubmitClaim,
  canProcessClaim,
  canManageInventory,

  // Formatting utilities
  formatCurrency,
  formatPercentage,
  formatNumber,
  truncateText,

  // Workflow utilities
  getClaimWorkflowStage,
  getNextClaimStatus,
  getClaimWorkflowProgress,

  // Calculations
  daysBetween,
  calculateAge,
  calculateAverage,

  // Error handling
  getErrorMessage,
  formatError,
};
