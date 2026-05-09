/**
 * Health Center Module Configuration
 * ====================================
 * 
 * Centralized configuration for the Health Center module
 * Adjust these values to customize module behavior
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  // Base URL for all API requests
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/phc',

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Enable request/response logging
  DEBUG_MODE: import.meta.env.MODE === 'development',

  // Retry configuration
  RETRY: {
    ENABLED: true,
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
  },
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  // Enable health center module
  ENABLED: import.meta.env.VITE_ENABLE_HEALTH_CENTER !== 'false',

  // Enable patient features
  PATIENT_FEATURES: {
    BOOK_APPOINTMENTS: true,
    VIEW_MEDICAL_HISTORY: true,
    SUBMIT_CLAIMS: true,
    MANAGE_HEALTH_PROFILE: true,
  },

  // Enable staff features
  STAFF_FEATURES: {
    PROCESS_CLAIMS: true,
    MANAGE_INVENTORY: true,
    VIEW_ALERTS: true,
    MARK_DOCTOR_ATTENDANCE: true,
  },

  // Advanced features
  ADVANCED: {
    ENABLE_PRESCRIPTION_RENEWAL: false,
    ENABLE_DOCTOR_NOTES: true,
    ENABLE_TELEHEALTH: false,
    ENABLE_ANALYTICS: false,
  },
};

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

export const STATUS_CONFIG = {
  // Appointment statuses
  APPOINTMENT_STATUS: {
    SCHEDULED: { label: 'Scheduled', color: 'blue', icon: 'calendar-plus' },
    COMPLETED: { label: 'Completed', color: 'green', icon: 'check' },
    CANCELLED: { label: 'Cancelled', color: 'red', icon: 'x' },
    CHECKED_IN: { label: 'Checked In', color: 'teal', icon: 'clock' },
  },

  // Claim statuses with workflow stages
  CLAIM_STATUS: {
    SUBMITTED: { label: 'Submitted', color: 'blue', stage: 1 },
    ACCOUNTS_VERIFICATION: { label: 'Accounts Review', color: 'yellow', stage: 2 },
    SANCTION_REVIEW: { label: 'Sanction Review', color: 'orange', stage: 3 },
    FINAL_PAYMENT: { label: 'Final Payment', color: 'teal', stage: 4 },
    REIMBURSED: { label: 'Reimbursed', color: 'green', stage: 5 },
    REJECTED: { label: 'Rejected', color: 'red', stage: 0 },
  },

  // Doctor availability statuses
  DOCTOR_STATUS: {
    AVAILABLE: { label: 'Available', color: 'green', icon: 'check-circle' },
    ON_BREAK: { label: 'On Break', color: 'yellow', icon: 'pause-circle' },
    DEPARTED: { label: 'Departed', color: 'red', icon: 'x-circle' },
    SCHEDULED: { label: 'Scheduled', color: 'blue', icon: 'calendar' },
  },

  // Stock level statuses
  STOCK_STATUS: {
    IN_STOCK: { label: 'In Stock', color: 'green' },
    LOW_STOCK: { label: 'Low Stock', color: 'yellow' },
    OUT_OF_STOCK: { label: 'Out of Stock', color: 'red' },
    EXPIRING: { label: 'Expiring Soon', color: 'orange' },
    EXPIRED: { label: 'Expired', color: 'red' },
  },
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  // Appointment booking rules
  APPOINTMENT: {
    MIN_DAYS_IN_ADVANCE: 1,
    MAX_DAYS_IN_ADVANCE: 30,
    CANCEL_WITHIN_HOURS: 24,
  },

  // Claim submission rules
  CLAIM: {
    MAX_SUBMISSION_DAYS: 30, // PHC-BR-06: Within 30 days of expense
    MIN_AMOUNT: 100,
    MAX_AMOUNT: 100000,
    REQUIRED_DOCUMENTS: 1,
  },

  // Document upload rules
  DOCUMENT: {
    MAX_FILE_SIZE_MB: 5,
    ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
    ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],
  },

  // Inventory rules
  INVENTORY: {
    MIN_QUANTITY: 0,
    REORDER_THRESHOLD_DEFAULT: 50,
    EXPIRY_WARNING_DAYS: 30,
  },
};

// ============================================================================
// PAGINATION AND TABLE CONFIGURATION
// ============================================================================

export const TABLE_CONFIG = {
  // Default page size for tables
  PAGE_SIZE: 10,

  // Available page sizes
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],

  // Enable/disable features
  ENABLE_SEARCH: true,
  ENABLE_SORT: true,
  ENABLE_FILTER: true,
  ENABLE_EXPORT: false,
};

// ============================================================================
// AUTO-REFRESH CONFIGURATION
// ============================================================================

export const REFRESH_CONFIG = {
  // Auto-refresh interval (milliseconds)
  STAFF_DASHBOARD_INTERVAL: 30000, // 30 seconds
  CLAIMS_LIST_INTERVAL: 30000,
  INVENTORY_INTERVAL: 60000, // 60 seconds

  // Enable auto-refresh
  ENABLE_AUTO_REFRESH: true,

  // Show refresh indicator
  SHOW_REFRESH_INDICATOR: true,
};

// ============================================================================
// NOTIFICATION CONFIGURATION
// ============================================================================

export const NOTIFICATION_CONFIG = {
  // Notification position
  POSITION: 'top-right',

  // Auto-hide duration (milliseconds)
  AUTO_CLOSE_DURATION: 4000,

  // Enable notifications
  ENABLED: true,

  // Notification types
  TYPES: {
    SUCCESS: { color: 'green', icon: 'check' },
    ERROR: { color: 'red', icon: 'x' },
    WARNING: { color: 'yellow', icon: 'alert' },
    INFO: { color: 'blue', icon: 'info' },
  },
};

// ============================================================================
// ACCESSIBILITY CONFIGURATION
// ============================================================================

export const A11Y_CONFIG = {
  // Enable keyboard navigation
  KEYBOARD_NAVIGATION: true,

  // Enable screen reader support
  SCREEN_READER_SUPPORT: true,

  // Minimum button size (in pixels)
  MIN_BUTTON_SIZE: 44,

  // High contrast mode
  HIGH_CONTRAST_MODE: false,

  // Reduce motion for animations
  REDUCE_MOTION: false,
};

// ============================================================================
// DATE AND TIME FORMATTING
// ============================================================================

export const DATE_TIME_CONFIG = {
  // Date format (using standard pattern)
  DATE_FORMAT: 'YYYY-MM-DD',

  // Time format
  TIME_FORMAT: 'HH:mm',

  // Full datetime format
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm',

  // Display format for users
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
  DISPLAY_TIME_FORMAT: 'h:mm A',
  DISPLAY_DATETIME_FORMAT: 'MMM DD, YYYY h:mm A',

  // Time zone handling
  USE_TIMEZONE: false,
  DEFAULT_TIMEZONE: 'UTC',
};

// ============================================================================
// ROLE-BASED CONFIGURATION
// ============================================================================

export const ROLE_CONFIG = {
  // Available roles in the module
  ROLES: {
    PATIENT: 'patient',
    STAFF: 'staff',
    PHC_STAFF: 'phc_staff',
    ACCOUNTS_STAFF: 'accounts_staff',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
  },

  // Feature access by role
  ROLE_FEATURES: {
    patient: ['book_appointment', 'view_medical_history', 'submit_claim', 'track_claim'],
    staff: ['book_appointment', 'view_medical_history', 'submit_claim', 'track_claim'],
    phc_staff: [
      'process_claims',
      'manage_inventory',
      'view_alerts',
      'mark_attendance',
      'view_reports',
    ],
    accounts_staff: ['process_claims', 'generate_reports', 'audit_claims'],
    doctor: ['manage_patients', 'prescribe_medicine', 'mark_attendance'],
    admin: ['all_features'],
  },
};

// ============================================================================
// EXPORT UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status configuration by key
 * @param {string} statusType - Status type (e.g., 'CLAIM_STATUS')
 * @param {string} statusValue - Status value (e.g., 'SUBMITTED')
 * @returns {object} Status configuration
 */
export function getStatusConfig(statusType, statusValue) {
  const config = STATUS_CONFIG[statusType];
  return config ? config[statusValue] : null;
}

/**
 * Check if feature is enabled
 * @param {string} featurePath - Dot notation path (e.g., 'PATIENT_FEATURES.BOOK_APPOINTMENTS')
 * @returns {boolean} Feature enabled
 */
export function isFeatureEnabled(featurePath) {
  const keys = featurePath.split('.');
  let value = FEATURES;
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return false;
  }
  return value === true;
}

/**
 * Get user role permissions
 * @param {string} role - User role
 * @returns {array} List of permissions
 */
export function getRolePermissions(role) {
  return ROLE_CONFIG.ROLE_FEATURES[role] || [];
}

/**
 * Check if user has permission
 * @param {string} role - User role
 * @param {string} permission - Required permission
 * @returns {boolean} Has permission
 */
export function hasPermission(role, permission) {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission) || permissions.includes('all_features');
}

// ============================================================================
// EXPORT ALL CONFIGURATION
// ============================================================================

export default {
  API_CONFIG,
  FEATURES,
  STATUS_CONFIG,
  VALIDATION_RULES,
  TABLE_CONFIG,
  REFRESH_CONFIG,
  NOTIFICATION_CONFIG,
  A11Y_CONFIG,
  DATE_TIME_CONFIG,
  ROLE_CONFIG,
};
