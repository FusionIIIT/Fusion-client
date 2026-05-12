/**
 * Visitor Hostel Validators
 * Reusable validation functions for forms
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate phone number format (supports Indian and international formats)
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/\D/g, "");
  // Allow 10-digit Indian numbers or 11-13 digit international
  return /^[0-9]{10}$/.test(cleanPhone) || /^[0-9]{11,13}$/.test(cleanPhone);
};

/**
 * Validate date range (departure > arrival)
 * @param {string} arrivalDate - YYYY-MM-DD format
 * @param {string} departureDate - YYYY-MM-DD format
 * @returns {boolean}
 */
export const validateDateRange = (arrivalDate, departureDate) => {
  if (!arrivalDate || !departureDate) return false;
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  return !isNaN(arrival.getTime()) && !isNaN(departure.getTime()) && departure > arrival;
};

/**
 * Validate required fields
 * @param {Object} formData
 * @param {Array<string>} requiredFields - field names
 * @returns {boolean}
 */
export const validateRequiredFields = (formData, requiredFields) => {
  if (!formData || !Array.isArray(requiredFields)) return false;
  return requiredFields.every((field) => {
    const value = formData[field];
    return value !== null && value !== undefined && value.toString().trim() !== "";
  });
};

/**
 * Validate room count against visitor count
 * @param {number} visitorCount
 * @param {number} roomCount
 * @returns {boolean}
 */
export const validateRoomCount = (visitorCount, roomCount) => {
  return Number.isInteger(roomCount) && Number.isInteger(visitorCount) && roomCount > 0 && visitorCount > 0;
};

/**
 * Validate name format (no numbers, minimum length)
 * @param {string} name
 * @returns {boolean}
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && /^[a-zA-Z\s'.,-]+$/.test(trimmedName);
};

/**
 * Validate positive number
 * @param {number|string} value
 * @returns {boolean}
 */
export const validatePositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate purpose of visit (minimum length and content)
 * @param {string} purpose
 * @returns {boolean}
 */
export const validatePurpose = (purpose) => {
  if (!purpose || typeof purpose !== 'string') return false;
  const trimmed = purpose.trim();
  return trimmed.length >= 5 && trimmed.length <= 200;
};

/**
 * Validate future date (not in the past)
 * @param {string} date - YYYY-MM-DD format
 * @returns {boolean}
 */
export const validateFutureDate = (date) => {
  if (!date) return false;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for date-only comparison
  return inputDate >= today;
};

/**
 * Validate student relation (BR-VH-008)
 * @param {string} relation
 * @returns {boolean}
 */
export const validateStudentRelation = (relation) => {
  if (!relation || typeof relation !== 'string') return false;
  const normalizedRelation = relation.trim().toLowerCase();
  return ['parent', 'spouse'].includes(normalizedRelation);
};

/**
 * Validate organization name
 * @param {string} organization
 * @returns {boolean}
 */
export const validateOrganization = (organization) => {
  if (!organization || typeof organization !== 'string') return false;
  const trimmed = organization.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Validate address
 * @param {string} address
 * @returns {boolean}
 */
export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return trimmed.length >= 10 && trimmed.length <= 500;
};

/**
 * Validate inventory item name
 * @param {string} itemName
 * @returns {boolean}
 */
export const validateInventoryItem = (itemName) => {
  if (!itemName || typeof itemName !== 'string') return false;
  const trimmed = itemName.trim();
  return trimmed.length >= 3 && trimmed.length <= 100 && /^[a-zA-Z0-9\s\-_().]+$/.test(trimmed);
};

/**
 * Validate bill number
 * @param {string} billNumber
 * @returns {boolean}
 */
export const validateBillNumber = (billNumber) => {
  if (!billNumber || typeof billNumber !== 'string') return false;
  const trimmed = billNumber.trim();
  return trimmed.length >= 3 && trimmed.length <= 50 && /^[a-zA-Z0-9\-_/]+$/.test(trimmed);
};

/**
 * Validate cost/price
 * @param {number|string} cost
 * @returns {boolean}
 */
export const validateCost = (cost) => {
  const num = Number(cost);
  return !isNaN(num) && num >= 0 && num <= 1000000; // Up to 10 lakh
};
