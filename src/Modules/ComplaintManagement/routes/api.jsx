import axios from "axios";
import { host } from "../../../routes/globalRoutes/index";

const hostAdd = host;

export const extractApiErrorMessage = (error, fallback = "Something went wrong.") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    const first = error.find((item) => item != null);
    return extractApiErrorMessage(first, fallback);
  }
  if (typeof error === "object") {
    const priorityKeys = ["message", "detail", "error", "non_field_errors"];
    for (const key of priorityKeys) {
      if (error[key]) return extractApiErrorMessage(error[key], fallback);
    }
    const keys = Object.keys(error);
    if (!keys.length) return fallback;
    const firstKey = keys[0];
    const fieldMessage = extractApiErrorMessage(error[firstKey], fallback);
    return typeof fieldMessage === "string" && fieldMessage !== fallback
      ? `${firstKey}: ${fieldMessage}`
      : fieldMessage;
  }
  return fallback;
};

export const getComplaintUserRole = async (token) => {
  const url = `${hostAdd}/complaint/`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// ─── New API module endpoints (with full UC/BR support) ─────────────

// UC-CM-001: Create a new complaint via the new API
export const createComplaint = async (complaintData, token) => {
  const url = `${hostAdd}/complaint/api/newcomplain/`;
  try {
    const response = await axios.post(url, complaintData, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-002: Get my complaints
export const getMyComplaints = async (token) => {
  const url = `${hostAdd}/complaint/api/studentcomplain/`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-002: Get single complaint detail (with timeline, caretaker, etc.)
export const getComplaintDetailNew = async (complaintId, token) => {
  const url = `${hostAdd}/complaint/api/user/detail/${complaintId}/`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-003: Update complaint progress (state machine enforced)
export const updateProgressNew = async (complaintId, data, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/progress/`;
  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-004: Escalate complaint
export const escalateComplaint = async (complaintId, justification, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/escalate/`;
  try {
    const response = await axios.post(url, { justification }, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const supervisorReassign = async (complaintId, caretakerId, note, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/supervisor-reassign/`;
  try {
    const response = await axios.post(url, {
      caretaker_id: caretakerId,
      note: note || "",
    }, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-005: Close/verify complaint
export const closeComplaint = async (complaintId, verified, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/close/`;
  try {
    const response = await axios.post(url, { verified }, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-006: Reopen complaint
export const reopenComplaint = async (complaintId, justification, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/reopen/`;
  try {
    const response = await axios.post(url, { justification }, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-011: Reopen request (supervisor approval flow)
export const createReopenRequest = async (complaintId, justification, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/reopen-request/`;
  try {
    const response = await axios.post(url, { action: "create", justification }, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const reviewReopenRequest = async (complaintId, requestId, approved, reviewNote, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/reopen-request/`;
  try {
    const response = await axios.post(url, {
      action: "review", request_id: requestId, approved, review_note: reviewNote,
    }, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getReopenRequests = async (complaintId, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/reopen-request/`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-007: Submit feedback (new ComplaintFeedback model)
export const submitComplaintFeedback = async (complaintId, rating, comments, token) => {
  const url = `${hostAdd}/complaint/api/complain/${complaintId}/feedback/`;
  try {
    const response = await axios.post(url, { rating, comments }, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-008: Get report with KPIs
export const getReportNew = async (filters, token) => {
  const url = `${hostAdd}/complaint/api/complaints/report/`;
  try {
    const response = await axios.get(url, {
      params: filters,
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getSupervisorDashboard = async (token) => {
  const url = `${hostAdd}/complaint/api/complaints/supervisor-dashboard/`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// UC-CM-008: Export report
export const exportReport = async (filters, format, token) => {
  const url = `${hostAdd}/complaint/api/complaints/export/`;
  try {
    const response = await axios.get(url, {
      params: { ...filters, export_format: format },
      headers: { Authorization: `Token ${token}` },
      responseType: "blob",
    });
    const headerDisposition = response.headers?.["content-disposition"] || "";
    const filenameMatch = /filename="?([^";]+)"?/i.exec(headerDisposition);
    const ext = format === "excel" ? "xlsx" : format === "pdf" ? "pdf" : "csv";
    const downloadName = filenameMatch?.[1] || `complaint_report.${ext}`;
    const mimeType = response.headers?.["content-type"] || "application/octet-stream";
    const blob = new Blob([response.data], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
    return { success: true };
  } catch (error) {
    let parsedError = error.response?.data || error.message;
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        parsedError = JSON.parse(text);
      } catch {
        parsedError = await error.response.data.text();
      }
    }
    return { success: false, error: parsedError };
  }
};

// UC-CM-012: Admin oversight
export const getAdminComplaints = async (token, scope = "overdue_escalated") => {
  const url = `${hostAdd}/complaint/api/complaints/admin/`;
  try {
    const response = await axios.get(url, {
      params: { scope },
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const adminAssign = async (complaintId, caretakerId, supervisorId, token) => {
  const url = `${hostAdd}/complaint/api/complaints/admin/`;
  const body = { complaint_id: complaintId };
  if (caretakerId) body.caretaker_id = caretakerId;
  if (supervisorId) body.supervisor_id = supervisorId;
  try {
    const response = await axios.post(url, body, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getCaretakers = async (token) => {
  const url = `${hostAdd}/complaint/api/caretakers/`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getSupervisors = async (token) => {
  const url = `${hostAdd}/complaint/api/supervisors/`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// ─── Legacy endpoints (kept for backward compatibility) ─────────────

export const lodgeComplaint = async (role, complaintData, token) => {
  const url = role.includes("service_provider")
    ? `${hostAdd}/complaint/service_provider/lodge/`
    : role.includes("caretaker") || role.includes("convener")
      ? `${hostAdd}/complaint/caretaker/lodge/`
      : `${hostAdd}/complaint/user/`;

  try {
    const response = await axios.post(url, complaintData, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getComplaintDetails = async (complaintId, token) => {
  const url = `${hostAdd}/complaint/caretaker/detail2/${complaintId}/`;
  try {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getComplaintsByRole = async (role, token) => {
  const url = role.includes("service_provider")
    ? `${hostAdd}/complaint/service_provider/`
    : role.includes("caretaker") || role.includes("convener")
      ? `${hostAdd}/complaint/caretaker/`
      : `${hostAdd}/complaint/user/`;

  try {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getUserComplaints = async (token) => {
  const url = `${hostAdd}/complaint/user/`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getComplaintReport = async (filters, token) => {
  const url = `${hostAdd}/complaint/generate-report/`;
  try {
    const response = await axios.get(url, {
      params: filters,
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const forwardComplaint = async (complaintId, token) => {
  const url = `${host}/complaint/caretaker/${complaintId}/`;
  try {
    const response = await axios.post(url, {}, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const updateComplaintStatus = async (complaintId, formData, token) => {
  const url = `${host}/complaint/caretaker/pending/${complaintId}/`;
  try {
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const submitFeedback = async (complaintId, feedbackData, token) => {
  const url = `${host}/complaint/user/${complaintId}/`;
  try {
    const response = await axios.post(url, feedbackData, {
      headers: { Authorization: `Token ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};
