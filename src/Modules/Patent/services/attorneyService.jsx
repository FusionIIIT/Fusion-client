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

/**
 * Service for managing attorney assignments (UC-006).
 * PCC Admin assigns an external attorney to a patent application.
 */
export const attorneyAssignmentService = {
  /**
   * Get attorney assignment for a specific application.
   * @param {number|string} applicationId
   * @returns {Promise<Object|null>}
   */
  getAssignment: async (applicationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/attorney/`,
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error fetching attorney assignment:", error);
      throw error;
    }
  },

  /**
   * Assign or update attorney for an application.
   * @param {number|string} applicationId
   * @param {Object} data - { attorney_name, attorney_email, attorney_phone, attorney_firm, specialization, engagement_proof?, remarks }
   * @returns {Promise<Object>}
   */
  assignAttorney: async (applicationId, data) => {
    try {
      const formData = new FormData();
      formData.append("attorney_name", data.attorney_name || "");
      formData.append("attorney_email", data.attorney_email || "");
      formData.append("attorney_phone", data.attorney_phone || "");
      formData.append("attorney_firm", data.attorney_firm || "");
      formData.append("specialization", data.specialization || "");
      formData.append("remarks", data.remarks || "");
      if (data.engagement_proof) {
        formData.append("engagement_proof", data.engagement_proof);
      }

      const response = await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/attorney/`,
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
      if (error.response?.status === 403) {
        throw new Error(
          error.response?.data?.error ||
            "You do not have permission to perform this action.",
        );
      }
      console.error("Error assigning attorney:", error);
      throw error;
    }
  },
};

/**
 * Service for managing patentability assessments (UC-007).
 * PCC Admin records the assessment done by the external attorney.
 */
export const patentabilityAssessmentService = {
  /**
   * Get patentability assessment for a specific application.
   * @param {number|string} applicationId
   * @returns {Promise<Object|null>}
   */
  getAssessment: async (applicationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/assessment/`,
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error fetching patentability assessment:", error);
      throw error;
    }
  },

  /**
   * Record or update patentability assessment for an application.
   * @param {number|string} applicationId
   * @param {Object} data - { assessed_by_attorney, novelty_score, non_obviousness_score, utility_score, search_completeness, recommendation, opinion_summary, prior_art_references, attorney_report? }
   * @returns {Promise<Object>}
   */
  recordAssessment: async (applicationId, data) => {
    try {
      const formData = new FormData();
      formData.append("assessed_by_attorney", data.assessed_by_attorney || "");
      formData.append("novelty_score", data.novelty_score || "");
      formData.append(
        "non_obviousness_score",
        data.non_obviousness_score || "",
      );
      formData.append("utility_score", data.utility_score || "");
      formData.append("search_completeness", data.search_completeness || "");
      formData.append("recommendation", data.recommendation || "");
      formData.append("opinion_summary", data.opinion_summary || "");
      formData.append("prior_art_references", data.prior_art_references || "");
      if (data.attorney_report) {
        formData.append("attorney_report", data.attorney_report);
      }

      const response = await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/assessment/`,
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
      if (error.response?.status === 403) {
        throw new Error(
          error.response?.data?.error ||
            "You do not have permission to perform this action.",
        );
      }
      console.error("Error recording patentability assessment:", error);
      throw error;
    }
  },
};

/**
 * Service for managing filing records (UC-009).
 * PCC Admin records the patent filing details after it has been filed.
 */
export const filingRecordService = {
  /**
   * Get filing record for a specific application.
   * @param {number|string} applicationId
   * @returns {Promise<Object|null>}
   */
  getFilingRecord: async (applicationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/filing/`,
        authHeaders(),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error fetching filing record:", error);
      throw error;
    }
  },

  /**
   * Record or update filing for an application.
   * @param {number|string} applicationId
   * @param {Object} data - { filing_office, jurisdiction, external_filing_id, filing_date, confirmation_proof?, international_filing_justification, remarks }
   * @returns {Promise<Object>}
   */
  recordFiling: async (applicationId, data) => {
    try {
      const formData = new FormData();
      formData.append("filing_office", data.filing_office || "");
      formData.append("jurisdiction", data.jurisdiction || "");
      formData.append("external_filing_id", data.external_filing_id || "");
      formData.append("filing_date", data.filing_date || "");
      formData.append(
        "international_filing_justification",
        data.international_filing_justification || "",
      );
      formData.append("remarks", data.remarks || "");
      if (data.confirmation_proof) {
        formData.append("confirmation_proof", data.confirmation_proof);
      }

      const response = await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/filing/`,
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
      if (error.response?.status === 403) {
        throw new Error(
          error.response?.data?.error ||
            "You do not have permission to perform this action.",
        );
      }
      console.error("Error recording filing:", error);
      throw error;
    }
  },
};
