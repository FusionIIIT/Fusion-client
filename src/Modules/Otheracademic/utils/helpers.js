/**
 * Utility functions for Otheracademic module.
 */

/**
 * Format date to YYYY-MM-DD format.
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Format date for display (e.g., "Mar 23, 2026").
 */
export const formatDisplayDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Validate date range (start date before end date).
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return new Date(startDate) <= new Date(endDate);
};

/**
 * Validate phone number (10 digits).
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return true;
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Semester options for dropdowns.
 */
export const SEMESTER_OPTIONS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

/**
 * Branch options for dropdowns.
 */
export const BRANCH_OPTIONS = [
  { value: 'CSE', label: 'Computer Science and Engineering' },
  { value: 'ECE', label: 'Electronics and Communication Engineering' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'SM', label: 'Smart Manufacturing' },
  { value: 'DS', label: 'Design' },
];

/**
 * Leave type options for UG.
 */
export const LEAVE_TYPE_OPTIONS = [
  { value: 'Casual', label: 'Casual' },
  { value: 'Medical', label: 'Medical' },
];

/**
 * Leave type options for PG.
 */
export const LEAVE_TYPE_PG_OPTIONS = [
  { value: 'Casual', label: 'Casual' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Vacation', label: 'Vacation' },
  { value: 'Duty', label: 'Duty' },
];

/**
 * Get status color for display.
 */
export const getStatusColor = (status) => {
  const statusLower = String(status).toLowerCase();
  switch (statusLower) {
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    case 'pending':
    default:
      return 'orange';
  }
};

/**
 * Create FormData from an object.
 */
export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};
