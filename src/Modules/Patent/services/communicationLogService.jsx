import axios from "axios";
import { host } from "../../../routes/globalRoutes/index.jsx";

const API_BASE_URL = `${host}/patentsystem`;

// Helper function to get token
const getAuthToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  return token;
};

const authHeaders = () => ({
  headers: {
    Authorization: `Token ${getAuthToken()}`,
    "Content-Type": "application/json",
  },
});

const authHeadersMultipart = () => ({
  headers: {
    Authorization: `Token ${getAuthToken()}`,
    "Content-Type": "multipart/form-data",
  },
});

export const communicationLogService = {
  /**
   * Get all communication logs for a specific application.
   * @param {number|string} applicationId
   * @returns {Promise<Array>} Array of log objects
   */
  getLogs: async (applicationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/communications/`,
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      console.error("Error fetching communication logs:", error);
      throw error;
    }
  },

  /**
   * Add a new communication log entry.
   * Supports file attachment via multipart/form-data.
   * @param {number|string} applicationId
   * @param {Object} data - { direction, subject, body, external_party_name, external_party_email, attachment? }
   * @returns {Promise<Object>}
   */
  addLog: async (applicationId, data) => {
    try {
      const formData = new FormData();
      formData.append("direction", data.direction || "");
      formData.append("subject", data.subject || "");
      formData.append("body", data.body || "");
      formData.append("external_party_name", data.external_party_name || "");
      formData.append("external_party_email", data.external_party_email || "");
      formData.append(
        "confidentiality_level",
        data.confidentiality_level || "Internal",
      );
      if (data.attachment) {
        formData.append("attachment", data.attachment);
      }

      const response = await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/communications/`,
        formData,
        authHeadersMultipart(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      if (error.response?.status === 400) {
        throw new Error(
          error.response?.data?.error ||
            "Invalid data. Please check your input.",
        );
      }
      console.error("Error adding communication log:", error);
      throw error;
    }
  },
};

export const budgetService = {
  /**
   * Get budget details for an application.
   * @param {number|string} applicationId
   * @returns {Promise<Object|null>}
   */
  getBudget: async (applicationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/budget/`,
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      console.error("Error fetching budget:", error);
      throw error;
    }
  },

  /**
   * Create or update budget for an application.
   * @param {number|string} applicationId
   * @param {Object} data - { filing_cost, attorney_fees, administrative_cost, remarks }
   * @returns {Promise<Object>}
   */
  saveBudget: async (applicationId, data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/budget/`,
        data,
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      console.error("Error saving budget:", error);
      throw error;
    }
  },
};

export const auditService = {
  /**
   * Get audit logs for an application.
   * @param {number|string} applicationId
   * @returns {Promise<Array>}
   */
  getAuditLogs: async (applicationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/audit/`,
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  },
};

export const analyticsService = {
  /**
   * Get application statistics.
   * @returns {Promise<Object>}
   */
  getStats: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/analytics/`,
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      console.error("Error fetching analytics:", error);
      throw error;
    }
  },
};

export const applicantService = {
  /**
   * Resubmit a rejected/needs-revision application.
   * @param {number|string} applicationId
   * @returns {Promise<Object>}
   */
  resubmit: async (applicationId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/applicant/applications/resubmit/${applicationId}/`,
        {},
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      console.error("Error resubmitting application:", error);
      throw error;
    }
  },

  /**
   * Withdraw an application.
   * @param {number|string} applicationId
   * @param {string} reason
   * @returns {Promise<Object>}
   */
  withdraw: async (applicationId, reason) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/applicant/applications/withdraw/${applicationId}/`,
        { reason },
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      console.error("Error withdrawing application:", error);
      throw error;
    }
  },
};
