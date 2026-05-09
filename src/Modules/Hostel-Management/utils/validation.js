// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

// Roll number validation
export const isValidRollNumber = (rollNo) => {
  return rollNo && rollNo.trim().length > 0;
};

// Date validation
export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !Number.isNaN(d.getTime());
};

// Check if past date
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

// Validate date range
export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

// Number validation
export const isValidNumber = (num) => {
  return !Number.isNaN(Number(num)) && num !== "" && num !== null;
};

// Room number validation
export const isValidRoomNumber = (room) => {
  return room && room.trim().length > 0;
};

// Generic validation for required fields
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`;
  }
  return "";
};

// Validate form object
export const validateForm = (formData, validationRules) => {
  const errors = {};
  Object.keys(validationRules).forEach((field) => {
    const rule = validationRules[field];
    const error = rule(formData[field]);
    if (error) {
      errors[field] = error;
    }
  });
  return errors;
};
