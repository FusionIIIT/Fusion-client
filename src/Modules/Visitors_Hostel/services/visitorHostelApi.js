/**
 * Centralized Visitor Hostel API Service
 * Handles all REST API communication with the backend
 * 
 * Maps to: applications/visitor_hostel/api/
 * Backend Documentation: See applications/visitor_hostel/api/urls.py
 * 
 * Usage:
 *   import { bookingsAPI, roomsAPI, inventoryAPI } from "../services/visitorHostelApi";
 *   
 *   // Get pending bookings
 *   const pending = await bookingsAPI.getPendingBookings();
 *   
 *   // Request new booking
 *   const booking = await bookingsAPI.requestBooking({ intender: 23, ... });
 */

import axios from "axios";

const API_BASE = "/visitorhostel/api";
const IST_TIMEZONE = "Asia/Kolkata";

const getISTTimeParts = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

  return {
    hour,
    minute,
    formatted: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
  };
};

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ============================================================
// REQUEST INTERCEPTOR - Add auth token to all requests
// ============================================================
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR - Handle global errors
// ============================================================
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - Token may have expired");
      // Trigger logout/redirect as needed
    }
    return Promise.reject(error);
  }
);

// ============================================================
// ERROR HANDLER UTILITY
// ============================================================
const getErrorMessage = (error, fallbackMessage = "Request failed") => {
  const payload = error.response?.data;

  let fieldMessage = "";
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const fieldKeys = Object.keys(payload).filter(
      (key) => !["detail", "error", "message"].includes(key)
    );

    if (fieldKeys.length > 0) {
      const firstField = fieldKeys[0];
      const firstFieldValue = payload[firstField];
      const firstFieldMessage = Array.isArray(firstFieldValue)
        ? firstFieldValue[0]
        : firstFieldValue;

      if (firstFieldMessage) {
        fieldMessage = `${firstField}: ${firstFieldMessage}`;
      }
    }
  }

  return (
    fieldMessage ||
    payload?.detail ||
    payload?.error ||
    payload?.message ||
    error.message ||
    fallbackMessage
  );
};

const buildListFetchSuccess = (data) => ({
  success: true,
  data: data.results || [],
  total_pages: data.total_pages || 1,
});

const buildListFetchFailure = (error, fallbackMessage) => ({
  success: false,
  data: [],
  total_pages: 1,
  message: getErrorMessage(error, fallbackMessage),
});

const buildDetailFetchSuccess = (data) => ({
  success: true,
  data,
});

const buildDetailFetchFailure = (error, fallbackMessage) => ({
  success: false,
  data: null,
  message: getErrorMessage(error, fallbackMessage),
});

const handleError = (error) => {
  const payload = error.response?.data;
  const message = getErrorMessage(error, "Request failed");

  console.error("API Error:", payload || error.message);

  const normalizedError = new Error(message);
  normalizedError.detail = payload?.detail;
  normalizedError.error = payload?.error;
  normalizedError.payload = payload;
  normalizedError.status = error.response?.status;
  throw normalizedError;
};

// ===========================================================================
// VHMS TRACEABILITY INDEX (UC/BR -> FRONTEND API GROUP)
// ---------------------------------------------------------------------------
// UC-VH-001,002,003,004,005,006,007,008,009 : bookingsAPI
//   BR-VH-001,002,003,004,005,006,008,009,010,012,014,017,018 linkage points
// UC-VH-007                                  : roomsAPI
//   BR-VH-012 linkage points
// UC-VH-010                                  : mealsAPI
//   BR-VH-011 linkage points
// UC-VH-011                                  : inventoryAPI
//   BR-VH-007,016 linkage points
// UC-VH-012                                  : reportsAPI
//   BR-VH-017 linkage points
// NOTE:
// - This index maps functional ownership so UC/BR-based reviews are quick.
// - Final source of truth remains backend authorization and validation.
// ===========================================================================

// ============================================================
// BOOKINGS API
// ============================================================

export const bookingsAPI = {
  /**
   * GET /api/bookings/pending/
   * Fetch all pending booking requests
   * @returns {Object} Response with success flag and bookings array
   */
  getPendingBookings: async (params = {}) => {
    try {
      const { data } = await client.get("/bookings/pending/", { params });
      return buildListFetchSuccess(data);
    } catch (error) {
      return buildListFetchFailure(error, "Failed to fetch pending bookings");
    }
  },

  /**
   * GET /api/bookings/active/
   * Fetch all active bookings (confirmed, checked-in, etc.)
   * @returns {Object} Response with success flag and bookings array
   */
  getActiveBookings: async (params = {}) => {
    try {
      const { data } = await client.get("/bookings/active/", { params });
      return buildListFetchSuccess(data);
    } catch (error) {
      return buildListFetchFailure(error, "Failed to fetch active bookings");
    }
  },

  /**
   * GET /api/bookings/completed/
   * Fetch all completed bookings (checked out)
   * @returns {Object} Response with success flag and bookings array
   */
  getCompletedBookings: async (params = {}) => {
    try {
      const { data } = await client.get("/bookings/completed/", { params });
      return buildListFetchSuccess(data);
    } catch (error) {
      return buildListFetchFailure(error, "Failed to fetch completed bookings");
    }
  },

  /**
   * Build cancellation view by combining finalized cancellations and cancellation requests.
   */
  getCancelledBookings: async (params = {}) => {
    try {
      const [completedResponse, bookingsResponse] = await Promise.all([
        client.get("/bookings/completed/", { params }),
        client.get("/bookings/pending/", {
          params: {
            ...params,
            view: "bookings",
          },
        }),
      ]);

      const normalizeForCancellationTable = (booking) => ({
        ...booking,
        visitor_email: booking.visitor_email || booking.guest_email || "N/A",
        cancellation_reason:
          booking.cancellation_reason || booking.remarks || booking.remark || "N/A",
        cancelled_on: booking.cancelled_on || booking.created_at || booking.booking_to || null,
      });

      const cancelled = (completedResponse.data.results || [])
        .filter((booking) => booking.status === "Canceled")
        .map(normalizeForCancellationTable);

      const cancellationRequests = (bookingsResponse.data.results || [])
        .filter((booking) => booking.status === "CancelRequested")
        .map(normalizeForCancellationTable);

      const merged = [...cancellationRequests, ...cancelled].sort((a, b) => {
        const left = new Date(a.cancelled_on || a.created_at || 0).getTime();
        const right = new Date(b.cancelled_on || b.created_at || 0).getTime();
        return right - left;
      });

      return {
        success: true,
        data: merged,
        total_pages: 1,
      };
    } catch (error) {
      return buildListFetchFailure(error, "Failed to fetch cancelled bookings");
    }
  },

  /**
   * GET /api/bookings/{id}/
   * Fetch detailed information for a specific booking
   * @param {number} bookingId - Booking ID
   * @returns {Object} Booking detail response
   */
  getBookingDetail: async (bookingId) => {
    try {
      const { data } = await client.get(`/bookings/${bookingId}/`);
      return buildDetailFetchSuccess(data);
    } catch (error) {
      return buildDetailFetchFailure(error, "Failed to fetch booking detail");
    }
  },

  /**
   * POST /api/bookings/request/
   * Submit a new booking request
   * @param {Object} payload - Request body with booking details
   * @returns {Object} Success response
   */
  requestBooking: async (payload) => {
    try {
      const { data } = await client.post("/bookings/request/", payload);
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/request/
   * Create offline booking (UC-VH-006) - for caretakers recording telephonic/walk-in bookings
   * @param {Object} offlineBookingData - Complete offline booking information
   * @returns {Object} Success response
   */
  createOfflineBooking: async (offlineBookingData) => {
    try {
      const { data } = await client.post("/bookings/request/", {
        ...offlineBookingData,
        is_offline: true, // Flag to mark as offline booking
        booking_source: offlineBookingData.booking_type || 'telephonic', // telephonic or walkin
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/confirm/
   * Confirm a pending booking and assign rooms (VhIncharge only)
   * @param {number} bookingId - Booking ID to confirm
   * @param {string} category - Room category code (e.g., "RP", "DLX")
   * @param {Array<string>} rooms - List of room numbers to assign
   * @returns {Object} Success response
   */
  confirmBooking: async (bookingId, category, rooms) => {
    try {
      const { data } = await client.post("/bookings/confirm/", {
        booking_id: bookingId,
        category,
        rooms,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/cancel-request/
   * Request cancellation of a confirmed booking (Intender only)
   * @param {number} bookingId - Booking ID
   * @param {string} remark - Cancellation reason (optional)
   * @returns {Object} Success response
   */
  cancelBookingRequest: async (bookingId, remark = "") => {
    try {
      const { data } = await client.post("/bookings/cancel-request/", {
        booking_id: bookingId,
        remark,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/cancel-approve/
    * Caretaker approves cancellation request and finalizes cancellation
   */
  approveCancelRequest: async (bookingId, remark = "") => {
    try {
      const { data } = await client.post("/bookings/cancel-approve/", {
        booking_id: bookingId,
        remark,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/reject/
   * Reject a pending booking request (VhIncharge only)
   * @param {number} bookingId - Booking ID to reject
   * @param {string} remark - Rejection reason (optional)
   * @returns {Object} Success response
   */
  rejectBooking: async (bookingId, remark = "") => {
    try {
      const { data } = await client.post("/bookings/reject/", {
        booking_id: bookingId,
        remark,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/forward/
   * Forward a booking to a different category/rooms (VhIncharge only)
   * @param {number} bookingId - Booking ID
   * @param {string} modifiedCategory - New room category
   * @param {Array<string>} rooms - New room assignments
   * @param {string} remark - Forward reason (optional)
   * @returns {Object} Success response
   */
  forwardBooking: async (bookingId, modifiedCategory, rooms, remark = "", billSettlement = "") => {
    try {
      const { data } = await client.post("/bookings/forward/", {
        booking_id: bookingId,
        modified_category: modifiedCategory,
        rooms,
        remark,
        bill_settlement: billSettlement,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/checkin/
  * Check in a visitor (VhCaretaker)
   * @param {number} bookingId - Booking ID
   * @param {string} name - Visitor full name
   * @param {string} phone - Visitor phone number
   * @param {string} email - Visitor email (optional)
   * @param {string} address - Visitor address (optional)
   * @returns {Object} Success response
   */
  checkIn: async (bookingId, name, phone, email = "", address = "") => {
    try {
      const { data } = await client.post("/bookings/checkin/", {
        booking_id: bookingId,
        name,
        phone,
        email,
        address,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/checkout/
  * Check out a visitor and finalize bills (VhCaretaker)
   * @param {number} bookingId - Booking ID
   * @param {number} mealBill - Total meal bill amount
   * @param {number} roomBill - Total room bill amount
   * @returns {Object} Success response
   */
  checkOut: async (bookingId, mealBill, roomBill, billSettlement = "Intender") => {
    try {
      const { data } = await client.post("/bookings/checkout/", {
        booking_id: bookingId,
        meal_bill: mealBill,
        room_bill: roomBill,
        bill_settlement: billSettlement,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/allocate-rooms/
   * Allocate available rooms for a confirmed booking (VhCaretaker)
   * @param {number} bookingId - Booking ID
   * @param {Array<string>} rooms - Selected room numbers
   * @returns {Object} Success response
   */
  allocateRooms: async (bookingId, rooms = []) => {
    try {
      const { data } = await client.post("/bookings/allocate-rooms/", {
        booking_id: bookingId,
        rooms,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/settle-bill/
   * Finalize offline bill settlement using receipt number (caretaker only)
   */
  settleBill: async (bookingId, settlementProof) => {
    try {
      const payload = {
        booking_id: bookingId,
        payment_status: true,
        settlement_proof: (settlementProof || "").toString().trim(),
      };

      const { data } = await client.post("/bookings/settle-bill/", payload);
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/update/
   * Update booking details and get forwarded room options
   * @param {number} bookingId - Booking ID
   * @param {number} numberOfPeople - Updated visitor count (optional)
   * @param {string} purposeOfVisit - Purpose of visit
   * @param {string} bookingFrom - Start date (YYYY-MM-DD)
   * @param {string} bookingTo - End date (YYYY-MM-DD)
   * @param {number} numberOfRooms - Number of rooms needed
   * @returns {Object} Updated booking and forwarded room options
   */
  updateBooking: async (
    bookingId,
    numberOfPeople,
    purposeOfVisit,
    bookingFrom,
    bookingTo,
    numberOfRooms
  ) => {
    try {
      const { data } = await client.post("/bookings/update/", {
        booking_id: bookingId,
        number_of_people: numberOfPeople,
        purpose_of_visit: purposeOfVisit,
        booking_from: bookingFrom,
        booking_to: bookingTo,
        number_of_rooms: numberOfRooms,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/detect-no-shows/
   */
  detectNoShows: async () => {
    try {
      const { data } = await client.post("/bookings/detect-no-shows/");
      return { success: true, data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/bookings/detect-overstays/
   * BR-VH-018: Get current overstay information without triggering alerts
   * @returns {Object} Overstay data with detailed information
   */
  detectOverstays: async () => {
    try {
      const { data } = await client.get("/bookings/detect-overstays/");
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bookings/detect-overstays/
   * BR-VH-018: Trigger overstay detection and send alerts
   * Overstay alerts MUST be generated when checkout time is exceeded
   * @returns {Object} Alert results and overstay data
   */
  triggerOverstayAlerts: async () => {
    try {
      const { data } = await client.post("/bookings/detect-overstays/");
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/bookings/cancel-requests/
   * Get all bookings in cancellation workflow (CancelRequested or Canceled status)
   * Indenter: see own cancel-requested/canceled bookings only
   * Caretaker/Incharge: see all cancel-requested/canceled bookings
   * @returns {Object} Response with success flag and cancel-requested bookings array
   */
  getCancelRequestedBookings: async (params = {}) => {
    try {
      const { data } = await client.get("/bookings/cancel-requests/", { params });
      return buildListFetchSuccess(data);
    } catch (error) {
      return buildListFetchFailure(error, "Failed to fetch cancel-requested bookings");
    }
  },

  /**
   * POST /api/bookings/update-visitor-info/
   * Update visitor information during active stay (VhCaretaker only)
   * @param {number} bookingId - Booking ID
   * @param {Object} visitorInfo - Updated visitor information
   * @returns {Object} Success response with updated visitor info
   */
  updateVisitorInfo: async (bookingId, visitorInfo) => {
    try {
      const { data } = await client.post("/bookings/update-visitor-info/", {
        booking_id: bookingId,
        ...visitorInfo,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================================
// ROOMS API
// ============================================================

export const roomsAPI = {
  /**
   * GET /api/rooms/availability/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
   * Get list of available rooms within date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Array<string>} List of available room numbers
   */
  getAvailableRooms: async (startDate, endDate, category = "") => {
    try {
      const params = { start_date: startDate, end_date: endDate, category: category || "" };
      const { data } = await client.get("/rooms/availability/", { params });
      return data.available_rooms || [];
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/rooms/status/
   * Update room status (e.g., maintenance, blocked, available)
   * @param {string} roomNumber - Room number to update
   * @param {string} roomStatus - New status
   * @returns {Object} Success response
   */
  editRoomStatus: async (roomNumber, roomStatus) => {
    try {
      const { data } = await client.post("/rooms/status/", {
        room_number: roomNumber,
        room_status: roomStatus,
      });
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================================
// INVENTORY API
// ============================================================

export const inventoryAPI = {
  /**
   * POST /api/inventory/add/
   * Add new inventory item (VhIncharge only)
   * @param {string} itemName - Name of inventory item
   * @param {string} billNumber - Associated bill/invoice number
   * @param {number} quantity - Quantity
   * @param {number} cost - Total cost
   * @param {boolean} consumable - Is consumable item? (true/false)
   * @returns {Object} Success response
   */
  addInventory: async (inventoryData) => {
    try {
      // Support both old and new calling patterns
      let requestData;
      
      if (typeof inventoryData === 'object' && inventoryData.item_name) {
        // New UC-VH-011 format with enhanced fields
        requestData = {
          item_name: inventoryData.item_name,
          bill_number: inventoryData.bill_number,
          quantity: inventoryData.quantity,
          cost: inventoryData.cost,
          consumable: inventoryData.consumable,
          // UC-VH-011: Include new threshold management fields
          threshold_quantity: inventoryData.threshold_quantity || 5,
          unit: inventoryData.unit || 'pieces',
          category: inventoryData.category || '',
          remark: inventoryData.remark || '',
        };
      } else {
        // Legacy format for backward compatibility
        const [itemName, billNumber, quantity, cost, consumable] = arguments;
        requestData = {
          item_name: itemName,
          bill_number: billNumber,
          quantity,
          cost,
          consumable,
          threshold_quantity: 5,
          unit: 'pieces',
          category: '',
          remark: '',
        };
      }

      const { data } = await client.post("/inventory/add/", requestData);
      return { success: true, data };
    } catch (error) {
      console.error('Add inventory error:', error);
      return { success: false, message: error.response?.data?.detail || error.message };
    }
  },

  /**
   * POST /api/inventory/update/
    * Update quantity of existing inventory item (VhIncharge/VhCaretaker)
   * @param {number} itemId - Inventory item ID
   * @param {number} quantity - Updated quantity
   * @returns {Object} Success response
   */
  updateInventory: async (itemId, quantity) => {
    try {
      const { data } = await client.post("/inventory/update/", {
        id: itemId,
        quantity,
      });
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/inventory/list/
   * Fetch full inventory list for management table
   * @returns {Object} Inventory items
   */
  getInventoryList: async () => {
    try {
      const { data } = await client.get("/inventory/list/");
      return { success: true, data: data.results || [] };
    } catch (error) {
      return handleError(error);
    }
  },

  // UC-VH-011: Inventory threshold & replenishment APIs

  /**
   * GET /api/inventory/threshold-check/
   * Check inventory thresholds and get critical items (BR-VH-007)
   * @returns {Object} List of critical inventory items
   */
  checkInventoryThresholds: async () => {
    try {
      const { data } = await client.get("/inventory/threshold-check/");
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/inventory/threshold-check/
   * Manually trigger threshold check
   * @returns {Object} Success response
   */
  triggerThresholdCheck: async () => {
    try {
      const { data } = await client.post("/inventory/threshold-check/");
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/inventory/replenishment-request/
   * Create replenishment request (Caretaker only)
   * @param {number} itemId - Inventory item ID
   * @param {number} requestedQuantity - Quantity requested
   * @param {string} urgency - Urgency level
   * @param {string} justification - Justification for request
   * @returns {Object} Success response
   */
  createReplenishmentRequest: async (itemId, requestedQuantity, urgency, justification) => {
    try {
      const { data } = await client.post("/inventory/replenishment-request/", {
        item_id: itemId,
        requested_quantity: requestedQuantity,
        urgency,
        justification,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/inventory/replenishment-request/
   * Get replenishment requests based on user role
   * @returns {Object} List of replenishment requests
   */
  getReplenishmentRequests: async () => {
    try {
      const { data } = await client.get("/inventory/replenishment-request/");
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/inventory/approve-replenishment/
   * Approve replenishment request (VhIncharge only, BR-VH-016)
   * @param {number} requestId - Request ID
   * @param {number} approvedQuantity - Approved quantity
   * @param {string} approvalRemarks - Approval remarks
   * @returns {Object} Success response
   */
  approveReplenishmentRequest: async (requestId, approvedQuantity, approvalRemarks) => {
    try {
      const { data } = await client.post("/inventory/approve-replenishment/", {
        request_id: requestId,
        approved_quantity: approvedQuantity,
        approval_remarks: approvalRemarks,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/inventory/reject-replenishment/
   * Reject replenishment request (VhIncharge only, BR-VH-016)
   * @param {number} requestId - Request ID
   * @param {string} approvalRemarks - Rejection reason
   * @returns {Object} Success response
   */
  rejectReplenishmentRequest: async (requestId, approvalRemarks) => {
    try {
      const { data } = await client.post("/inventory/reject-replenishment/", {
        request_id: requestId,
        approval_remarks: approvalRemarks,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/inventory/update-quantity/
    * Update inventory quantity with threshold checking (VhIncharge/VhCaretaker)
   * @param {number} itemId - Item ID
   * @param {number} quantity - New quantity
   * @param {string} operation - Operation type ('set', 'add', 'subtract')
   * @returns {Object} Success response
   */
  updateInventoryQuantity: async (itemId, quantity, operation = 'set') => {
    try {
      const { data } = await client.post("/inventory/update-quantity/", {
        item_id: itemId,
        quantity,
        operation,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/inventory/mark-received/
   * Mark replenishment as received and update inventory
   * @param {number} requestId - Request ID
   * @param {number} actualCost - Actual cost
   * @param {string} deliveryDate - Delivery date (YYYY-MM-DD)
   * @returns {Object} Success response
   */
  markReplenishmentReceived: async (requestId, actualCost, deliveryDate) => {
    try {
      const { data } = await client.post("/inventory/mark-received/", {
        request_id: requestId,
        actual_cost: actualCost,
        delivery_date: deliveryDate,
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================================
// MEALS API
// ============================================================

export const mealsAPI = {
  /**
   * POST /api/meals/record/
   * Record meal consumption for a visitor (VhCaretaker only)
   * @param {number} visitorId - Visitor ID
   * @param {number} bookingId - Associated booking ID
   * @param {Object} mealData - Meal counts {m_tea, breakfast, lunch, eve_tea, dinner}
   * @returns {Object} Success response
   */
  recordMeal: async (visitorId, bookingId, mealData = {}) => {
    try {
      const { data } = await client.post("/meals/record/", {
        visitor_id: visitorId,
        booking_id: bookingId,
        m_tea: mealData.m_tea || 0,
        breakfast: mealData.breakfast || 0,
        lunch: mealData.lunch || 0,
        eve_tea: mealData.eve_tea || 0,
        dinner: mealData.dinner || 0,
      });
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/meals/record/
   * UC-VH-010: Book meals for guests with BR-VH-011 deadline validation
   * @param {Object} mealBookingData - Meal booking data
   * @param {number} mealBookingData.bookingId - Booking ID
   * @param {number} mealBookingData.visitorId - Visitor ID  
   * @param {number} mealBookingData.m_tea - Morning tea quantity
   * @param {number} mealBookingData.breakfast - Breakfast quantity
   * @param {number} mealBookingData.lunch - Lunch quantity
   * @param {number} mealBookingData.eve_tea - Evening tea quantity
   * @param {number} mealBookingData.dinner - Dinner quantity
   * @returns {Object} Success response with meal booking details
   */
  bookMeals: async (mealBookingData) => {
    try {
      // Determine primary meal type for deadline validation
      let mealType = '';
      const { m_tea, breakfast, lunch, eve_tea, dinner } = mealBookingData;
      
      if (lunch > 0) mealType = 'lunch';
      else if (dinner > 0) mealType = 'dinner';  
      else if (breakfast > 0) mealType = 'breakfast';
      else if (m_tea > 0 || eve_tea > 0) mealType = m_tea > 0 ? 'breakfast' : 'dinner';

      const { data } = await client.post("/meals/record/", {
        visitor_id: mealBookingData.visitorId,
        booking_id: mealBookingData.bookingId,
        m_tea: m_tea || 0,
        breakfast: breakfast || 0,
        lunch: lunch || 0,
        eve_tea: eve_tea || 0,
        dinner: dinner || 0,
        meal_type: mealType, // For BR-VH-011 deadline validation
      });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/meals/records/<booking_id>/
   * Get meal records for a specific booking
   * @param {number} bookingId - Booking ID
   * @returns {Object} Meal records with cost breakdown
   */
  getMealRecords: async (bookingId) => {
    try {
      const { data } = await client.get(`/meals/records/${bookingId}/`);
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Validate meal booking deadlines (client-side check)
    * BR-VH-011: Breakfast/Morning Tea ≤ 09:00, Lunch/Evening Tea ≤ 14:00, Dinner ≤ 19:30
   * @param {Object} mealData - Meal data to validate
   * @returns {Object} Validation result with warnings
   */
  validateMealDeadlines: (mealData) => {
    const { hour: currentHour, minute: currentMinute, formatted } = getISTTimeParts();
    const currentTimeDecimal = currentHour + currentMinute / 60;
    
    const warnings = [];
    
    // BR-VH-011: Check meal booking deadlines
    if ((mealData.breakfast > 0 || mealData.m_tea > 0) && currentTimeDecimal > 9) {
      warnings.push({
        meal: mealData.breakfast > 0 ? 'Breakfast' : 'Morning Tea',
        deadline: '09:00',
        current: formatted
      });
    }
    
    if ((mealData.lunch > 0 || mealData.eve_tea > 0) && currentTimeDecimal > 14) {
      warnings.push({
        meal: mealData.lunch > 0 ? 'Lunch' : 'Evening Tea',
        deadline: '14:00',
        current: formatted
      });
    }

    if (mealData.dinner > 0 && currentTimeDecimal > 19.5) {
      warnings.push({
        meal: 'Dinner',
        deadline: '19:30',
        current: formatted,
      });
    }
    
    return {
      isValid: warnings.length === 0,
      warnings,
      currentTime: formatted
    };
  },
};

// ============================================================
// REPORTS & BILLS API
// ============================================================

export const reportsAPI = {
  /**
   * GET /api/reports/bills/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
   * Generate bill report for date range (VhIncharge only)
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Object} Bill summary with meal_total, room_total, and detailed records
   */
  getBillsBetweenDates: async (startDate, endDate) => {
    try {
      const { data } = await client.get("/reports/bills/", {
        params: { start_date: startDate, end_date: endDate },
      });
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * POST /api/bills/generate/
   * Generate and finalize bill for a visitor (VhIncharge only)
   * @param {string} visitor - Visitor identifier/username
   * @param {number} messBill - Meal bill amount
   * @param {number} roomBill - Room bill amount
   * @param {string} status - Bill status (e.g., "paid", "pending")
   * @returns {Object} Success response
   */
  generateBill: async (visitor, messBill, roomBill, status) => {
    try {
      const { data } = await client.post("/bills/generate/", {
        visitor,
        mess_bill: messBill,
        room_bill: roomBill,
        status,
      });
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/reports/bookings/?days=7
   * Generate booking reports for specified period with offline audit tracking
   * UC-VH-012: Report generation with offline source audit flags (BR-VH-017)
   * @param {number} days - Number of days back to report (default 7)
   * @param {string} dateFrom - Optional start date (YYYY-MM-DD)
   * @param {string} dateTo - Optional end date (YYYY-MM-DD)
   * @returns {Object} Booking report with total, offline count, and records
   */
  getBookingsReport: async (days = 7, dateFrom = null, dateTo = null) => {
    try {
      const params = { days };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      
      const { data } = await client.get("/reports/bookings/", { params });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/reports/inventory/?days=7
   * Generate inventory health and replenishment reports
   * UC-VH-011: Inventory threshold and replenishment tracking (BR-VH-007, BR-VH-016)
   * @param {number} days - Number of days back to report (default 7)
   * @returns {Object} Inventory report with critical items, requests, and snapshot
   */
  getInventoryReport: async (days = 7) => {
    try {
      const { data } = await client.get("/reports/inventory/", { params: { days } });
      return { success: true, ...data };
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * GET /api/health/
 * Health check endpoint for API availability
 * @returns {Object} Health status response
 */
export const healthCheck = async () => {
  try {
    const { data } = await client.get("/health/");
    console.log("Visitor Hostel API Health: OK");
    return data;
  } catch (error) {
    console.error("Visitor Hostel API Health: FAILED");
    return handleError(error);
  }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  bookingsAPI,
  roomsAPI,
  inventoryAPI,
  mealsAPI,
  reportsAPI,
  healthCheck,
};
