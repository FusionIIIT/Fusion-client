/**
 * Centralized API service for Otheracademic module.
 * All API calls should go through this service layer.
 */
import axios from 'axios';
import { host } from '../../../routes/globalRoutes';

// Base URL for otheracademic API
const BASE_URL = `${host}/otheracademic/api`;

// API endpoints
const ENDPOINTS = {
  // Leave endpoints
  LEAVE_SUBMIT: `${BASE_URL}/leave-form-submit/`,
  LEAVE_PG_SUBMIT: `${BASE_URL}/leave-pg-submit/`,
  LEAVE_REQUESTS: `${BASE_URL}/get-leave-requests/`,
  LEAVE_PG_REQUESTS: `${BASE_URL}/get-pg-leave-requests/`,
  LEAVE_PENDING: `${BASE_URL}/fetch-pending-leaves/`,
  LEAVE_UPDATE_STATUS: `${BASE_URL}/update-leave-status/`,
  LEAVE_PENDING_TA: `${BASE_URL}/fetch-pending-leaves-ta/`,
  LEAVE_UPDATE_STATUS_TA: `${BASE_URL}/update-leave-status-ta/`,
  LEAVE_PENDING_THESIS: `${BASE_URL}/fetch-pending-leaves-thesis/`,
  LEAVE_UPDATE_STATUS_THESIS: `${BASE_URL}/update-leave-status-thesis/`,

  // Bonafide endpoints
  BONAFIDE_SUBMIT: `${BASE_URL}/bonafide-form-submit/`,
  BONAFIDE_STATUS: `${BASE_URL}/bonafide-status/`,
  BONAFIDE_PENDING: `${BASE_URL}/admin-bonafide-requests/`,
  BONAFIDE_UPDATE: `${BASE_URL}/admin-updates/`,

  // Assistantship endpoints
  ASSISTANTSHIP_SUBMIT: `${BASE_URL}/assistantship-form-submit/`,
  ASSISTANTSHIP_STATUS: `${BASE_URL}/get_assistantship_status/`,
  TA_SUPERVISOR_PENDING: `${BASE_URL}/TA-supervisor-pending-requests/`,
  TA_SUPERVISOR_UPDATE: `${BASE_URL}/TA-supervisor-assistantship-update/`,
  THESIS_SUPERVISOR_PENDING: `${BASE_URL}/Ths-supervisor-pending-requests/`,
  THESIS_SUPERVISOR_UPDATE: `${BASE_URL}/Ths-supervisor-assistantship-update/`,
  HOD_PENDING: `${BASE_URL}/deptadmin-pending-requests/`,
  HOD_UPDATE: `${BASE_URL}/deptadmin-update-status/`,
  ACAD_ADMIN_PENDING: `${BASE_URL}/acadadmin-pending-requests/`,
  ACAD_ADMIN_UPDATE: `${BASE_URL}/acadadmin-update-status/`,
  DEAN_PENDING: `${BASE_URL}/dean-pending-requests/`,
  DEAN_UPDATE: `${BASE_URL}/dean-update-status/`,
  DIRECTOR_PENDING: `${BASE_URL}/director-pending-requests/`,
  DIRECTOR_UPDATE: `${BASE_URL}/director-update-status/`,
};

/**
 * Get auth headers for API requests.
 */
const getAuthHeaders = () => {
  const authToken = localStorage.getItem('authToken');
  return {
    Authorization: `Token ${authToken}`,
  };
};

/**
 * Handle API errors consistently.
 */
const handleApiError = (error) => {
  console.error('API Error:', error.response?.data || error.message);
  throw error;
};

// ==================== LEAVE SERVICE ====================

export const leaveService = {
  /**
   * Submit UG leave form.
   */
  submitLeaveForm: async (formData) => {
    try {
      const response = await axios.post(ENDPOINTS.LEAVE_SUBMIT, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Submit PG leave form.
   */
  submitPGLeaveForm: async (formData) => {
    try {
      const response = await axios.post(ENDPOINTS.LEAVE_PG_SUBMIT, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get leave requests for a student.
   */
  getLeaveRequests: async (rollNo, username) => {
    try {
      const response = await axios.get(ENDPOINTS.LEAVE_REQUESTS, {
        headers: getAuthHeaders(),
        params: { roll_no: rollNo, username },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get PG leave requests for a student.
   */
  getPGLeaveRequests: async (rollNo, username) => {
    try {
      const response = await axios.get(ENDPOINTS.LEAVE_PG_REQUESTS, {
        headers: getAuthHeaders(),
        params: { roll_no: rollNo, username },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending leave requests (for HOD approval).
   */
  getPendingLeaves: async () => {
    try {
      const response = await axios.get(ENDPOINTS.LEAVE_PENDING, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update leave status (HOD approval).
   */
  updateLeaveStatus: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.LEAVE_UPDATE_STATUS,
        { approvedLeaves: approvedIds, rejectedLeaves: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending leaves for TA supervisor.
   */
  getPendingLeavesTA: async () => {
    try {
      const response = await axios.get(ENDPOINTS.LEAVE_PENDING_TA, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update leave status (TA supervisor).
   */
  updateLeaveStatusTA: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.LEAVE_UPDATE_STATUS_TA,
        { approvedLeaves: approvedIds, rejectedLeaves: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending leaves for Thesis supervisor.
   */
  getPendingLeavesThesis: async () => {
    try {
      const response = await axios.get(ENDPOINTS.LEAVE_PENDING_THESIS, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update leave status (Thesis supervisor).
   */
  updateLeaveStatusThesis: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.LEAVE_UPDATE_STATUS_THESIS,
        { approvedLeaves: approvedIds, rejectedLeaves: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// ==================== BONAFIDE SERVICE ====================

export const bonafideService = {
  /**
   * Submit bonafide form.
   */
  submitBonafideForm: async (formData) => {
    try {
      const response = await axios.post(ENDPOINTS.BONAFIDE_SUBMIT, formData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get bonafide status for a student.
   */
  getBonafideStatus: async (rollNo, username) => {
    try {
      const response = await axios.post(
        ENDPOINTS.BONAFIDE_STATUS,
        { roll_no: rollNo, username },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending bonafide requests (for admin).
   */
  getPendingBonafides: async () => {
    try {
      const response = await axios.get(ENDPOINTS.BONAFIDE_PENDING, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update bonafide status (admin approval).
   */
  updateBonafideStatus: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.BONAFIDE_UPDATE,
        { approvedBonafides: approvedIds, rejectedBonafides: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// ==================== ASSISTANTSHIP SERVICE ====================

export const assistantshipService = {
  /**
   * Submit assistantship form.
   */
  submitAssistantshipForm: async (formData) => {
    try {
      const response = await axios.post(ENDPOINTS.ASSISTANTSHIP_SUBMIT, formData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get assistantship status for a student.
   */
  getAssistantshipStatus: async (rollNo, username) => {
    try {
      const response = await axios.post(
        ENDPOINTS.ASSISTANTSHIP_STATUS,
        { roll_no: rollNo, username },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending requests for TA supervisor.
   */
  getTASupervisorPending: async () => {
    try {
      const response = await axios.get(ENDPOINTS.TA_SUPERVISOR_PENDING, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update status (TA supervisor).
   */
  updateTASupervisorStatus: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.TA_SUPERVISOR_UPDATE,
        { approvedRequests: approvedIds, rejectedRequests: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending requests for Thesis supervisor.
   */
  getThesisSupervisorPending: async () => {
    try {
      const response = await axios.get(ENDPOINTS.THESIS_SUPERVISOR_PENDING, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update status (Thesis supervisor).
   */
  updateThesisSupervisorStatus: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.THESIS_SUPERVISOR_UPDATE,
        { approvedRequests: approvedIds, rejectedRequests: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending requests for HOD.
   */
  getHODPending: async () => {
    try {
      const response = await axios.get(ENDPOINTS.HOD_PENDING, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update status (HOD).
   */
  updateHODStatus: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.HOD_UPDATE,
        { approvedRequests: approvedIds, rejectedRequests: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending requests for Academic Admin.
   */
  getAcadAdminPending: async () => {
    try {
      const response = await axios.get(ENDPOINTS.ACAD_ADMIN_PENDING, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update status (Academic Admin).
   */
  updateAcadAdminStatus: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.ACAD_ADMIN_UPDATE,
        { approvedRequests: approvedIds, rejectedRequests: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending requests for Dean.
   */
  getDeanPending: async () => {
    try {
      const response = await axios.get(ENDPOINTS.DEAN_PENDING, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update status (Dean).
   */
  updateDeanStatus: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.DEAN_UPDATE,
        { approvedRequests: approvedIds, rejectedRequests: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get pending requests for Director.
   */
  getDirectorPending: async () => {
    try {
      const response = await axios.get(ENDPOINTS.DIRECTOR_PENDING, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update status (Director).
   */
  updateDirectorStatus: async (approvedIds, rejectedIds) => {
    try {
      const response = await axios.post(
        ENDPOINTS.DIRECTOR_UPDATE,
        { approvedRequests: approvedIds, rejectedRequests: rejectedIds },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Export all endpoints for backward compatibility
export { ENDPOINTS };
