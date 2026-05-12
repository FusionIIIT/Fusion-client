/**
 * VH Module Constants
 * Centralized definitions for roles, statuses, categories, etc.
 */

export const USER_ROLES = {
  STUDENT: "Student",
  VH_INCHARGE: "VhIncharge",
  VH_CARETAKER: "VhCaretaker",
};

export const BOOKING_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "CheckedIn",
  CHECKED_OUT: "CheckedOut",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

export const ROOM_CATEGORIES = {
  DELUXE: "Deluxe",
  REGULAR: "Regular",
  ECONOMY: "Economy",
  SINGLE: "Single",
  DOUBLE: "Double",
};

export const MEAL_TYPES = {
  M_TEA: "m_tea",
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  EVE_TEA: "eve_tea",
  DINNER: "dinner",
};

export const BILL_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  SETTLED: "settled",
};

export const ROOM_STATUS = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  MAINTENANCE: "Maintenance",
  BLOCKED: "Blocked",
};

export const API_ENDPOINTS = {
  BOOKINGS_PENDING: "/api/visitorhostel/bookings/pending/",
  BOOKINGS_ACTIVE: "/api/visitorhostel/bookings/active/",
  BOOKINGS_CONFIRM: "/api/visitorhostel/bookings/confirm/",
  BOOKINGS_CANCEL: "/api/visitorhostel/bookings/cancel/",
  BOOKINGS_REJECT: "/api/visitorhostel/bookings/reject/",
  BOOKINGS_FORWARD: "/api/visitorhostel/bookings/forward/",
  ROOMS_AVAILABILITY: "/api/visitorhostel/rooms/availability/",
  INVENTORY_ADD: "/api/visitorhostel/inventory/add/",
  INVENTORY_LIST: "/api/visitorhostel/inventory/",
};

export const VALIDATION_RULES = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[0-9]{10}$/,
  MIN_BOOKING_DAYS: 1,
  MAX_BOOKING_DAYS: 90,
  MIN_ROOMS: 1,
  MAX_ROOMS: 10,
  MIN_VISITORS: 1,
  MAX_VISITORS: 50,
};

export const MESSAGES = {
  BOOKING_SUCCESS: "Booking submitted successfully",
  BOOKING_CONFIRMED: "Booking confirmed successfully",
  BOOKING_REJECTED: "Booking rejected successfully",
  BOOKING_CANCELLED: "Booking cancelled successfully",
  BOOKING_FORWARDED: "Booking forwarded successfully",
  CHECKOUT_SUCCESS: "Checkout completed successfully",
  INVENTORY_ADDED: "Inventory item added successfully",
  ERROR_GENERIC: "An error occurred. Please try again.",
  ERROR_INVALID_DATE: "Invalid date range selected",
  ERROR_INVALID_EMAIL: "Invalid email address",
  ERROR_INVALID_PHONE: "Invalid phone number",
};
