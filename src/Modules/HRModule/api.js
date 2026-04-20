import axios from "axios";
import { host } from "../../routes/globalRoutes"; // adjust path to your existing globalRoutes

// If you prefer not to import, you can set baseURL directly:
// const API_BASE = '/hr2/api';
const API_BASE = `${host}/hr2/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ==================== LEAVE ====================
export const getLeaveApplications = () => api.get("/leave-applications/");
export const createLeaveApplication = (data) => {
  if (data instanceof FormData) {
    return api.post("/leave-applications/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("/leave-applications/", data);
};
export const getLeaveApplication = (id) =>
  api.get(`/leave-applications/${id}/`);
export const updateLeaveApplication = (id, data) =>
  api.put(`/leave-applications/${id}/`, data);
export const deleteLeaveApplication = (id) =>
  api.delete(`/leave-applications/${id}/`);
export const downloadLeaveApplication = (id) =>
  api.get(`/leave-applications/${id}/download/`, { responseType: "blob" });
export const withdrawLeaveApplication = (id, remarks) =>
  api.post(`/leave-applications/${id}/withdraw/`, { remarks });
export const requestLeaveCancellation = (id, reason) =>
  api.post(`/leave-applications/${id}/cancel-request/`, { reason });
export const decideLeaveCancellation = (id, decision, remarks) =>
  api.post(`/leave-applications/${id}/cancel-decision/${decision}/`, {
    remarks,
  });
export const getLeaveBalance = (employeeId = null) => {
  const url = employeeId ? `/leave-balance/${employeeId}/` : "/leave-balance/";
  return api.get(url);
};
export const handleLeaveResponsibility = (id, type, action, remarks) =>
  api.post(`/leave-applications/${id}/responsibility/${type}/`, {
    action,
    remarks,
  });
export const approveRejectLeave = (id, decision, remarks) =>
  api.post(`/leave-applications/${id}/${decision}/`, { remarks });
export const requestLeaveDocument = (id, message) =>
  api.post(`/leave-applications/${id}/request-document/`, { message });
export const submitLeaveDocument = (id, submission) =>
  api.post(`/leave-applications/${id}/submit-document/`, { submission });
export const requestLeaveExtension = (id, payload = {}) =>
  api.post(`/leave-applications/${id}/extension-request/`, payload);
export const decideLeaveExtension = (id, decision, remarks) =>
  api.post(`/leave-applications/${id}/extension-decision/${decision}/`, {
    remarks,
  });
export const submitLeaveResumption = (id, payload = {}) =>
  api.post(`/leave-applications/${id}/resumption/`, payload);
export const decideLeaveResumption = (id, decision, remarks) =>
  api.post(`/leave-applications/${id}/resumption-decision/${decision}/`, {
    remarks,
  });
export const getLeaveNomineeQueue = () => api.get("/leave-nominee/");
export const decideLeaveNominee = (id, action) =>
  api.post(`/leave-nominee/${id}/`, { action });

// ==================== LTC ====================
export const getLTCApplications = () => api.get("/ltc/");
export const createLTCApplication = (data) => api.post("/ltc/", data);
export const getLTCApplication = (id) => api.get(`/ltc/${id}/`);
export const updateLTCApplication = (id, data) => api.put(`/ltc/${id}/`, data);
export const downloadLTCApplication = (id) =>
  api.get(`/ltc/${id}/download/`, { responseType: "blob" });
export const withdrawLTCApplication = (id, remarks) =>
  api.post(`/ltc/${id}/withdraw/`, { remarks });
export const approveRejectLTC = (id, decision, remarks) =>
  api.post(`/ltc/${id}/${decision}/`, { remarks });

// ==================== CPDA ADVANCE ====================
export const getCPDAAdvances = () => api.get("/cpda-advances/");
export const createCPDAAdvance = (data) => api.post("/cpda-advances/", data);
export const getCPDAAdvance = (id) => api.get(`/cpda-advances/${id}/`);
export const downloadCPDAAdvance = (id) =>
  api.get(`/cpda-advances/${id}/download/`, { responseType: "blob" });
export const withdrawCPDAAdvance = (id, remarks) =>
  api.post(`/cpda-advances/${id}/withdraw/`, { remarks });
export const approveRejectCPDAAdvance = (id, decision, remarks) =>
  api.post(`/cpda-advances/${id}/${decision}/`, { remarks });

// ==================== CPDA REIMBURSEMENT ====================
export const getCPDAReimbursements = () => api.get("/cpda-reimbursements/");
export const createCPDAReimbursement = (data) =>
  api.post("/cpda-reimbursements/", data);
export const getCPDAReimbursement = (id) =>
  api.get(`/cpda-reimbursements/${id}/`);
export const approveRejectCPDAReimbursement = (id, decision, remarks) =>
  api.post(`/cpda-reimbursements/${id}/${decision}/`, { remarks });

// ==================== APPRAISAL FORMS ====================
export const getAppraisalForms = () => api.get("/appraisal-forms/");
export const createAppraisalForm = (data) =>
  api.post("/appraisal-forms/", data);
export const getAppraisalForm = (id) => api.get(`/appraisal-forms/${id}/`);
export const downloadAppraisalForm = (id) =>
  api.get(`/appraisal-forms/${id}/download/`, { responseType: "blob" });
export const reviewAppraisalForm = (id, payload = {}) =>
  api.post(`/appraisal-forms/${id}/review/`, payload);
export const assignAppraisalForm = (id, payload = {}) =>
  api.post(`/appraisal-forms/${id}/assign/`, payload);
