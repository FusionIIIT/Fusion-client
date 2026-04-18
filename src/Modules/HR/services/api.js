// src/Modules/HR/services/hrApi.js
const getToken = () => localStorage.getItem("authToken");
const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Token ${token}` } : {};
};
const handleResponse = async (response) => {
  if (!response.ok)
    throw new Error((await response.text()) || response.statusText);
  return response.json();
};

const normalizeInboxRow = (item) => ({
  id: item.id || item.file_id,
  user: item.sent_by_user || item.uploader_name || item.user || item.name,
  name: item.sent_by_user || item.uploader_name || item.user || item.name,
  designation:
    item.sent_by_designation || item.designation_name || item.designation,
  date: item.upload_date || item.date || item.submissionDate,
  submissionDate: item.upload_date || item.date || item.submissionDate,
});

export const getCpdaAdvRequests = async () => {
  const resp = await fetch("/api/hr/cpda_adv/requests", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.cpda_adv_requests ?? []).map(normalizeInboxRow);
};

export const getCpdaAdvInbox = async () => {
  const resp = await fetch("/api/hr/cpda_adv/inbox", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.cpda_adv_inbox ?? []).map(normalizeInboxRow);
};

export const getCpdaAdvArchive = async () => {
  const resp = await fetch("/api/hr/cpda_adv/archive", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.cpda_adv_archive ?? []).map(normalizeInboxRow);
};

export const getCpdaAdvForm = async (id) => {
  const resp = await fetch(`/api/hr/cpda_adv/form/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const getFormTrack = async (id) => {
  const resp = await fetch(`/api/hr/formtrack/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const searchEmployees = async (searchText) => {
  if (!searchText || searchText.length < 3) return [];
  const resp = await fetch(
    `/api/hr/search_employees?search_text=${encodeURIComponent(searchText)}`,
    {
      headers: authHeaders(),
    },
  );
  const data = await handleResponse(resp);
  return data.employees ?? [];
};

export const fetchInboxData = async () => {
  throw new Error("Mock data fallback");
};

export const getLtcRequests = async () => {
  const resp = await fetch("/api/hr/ltc/requests", { headers: authHeaders() });
  const data = await handleResponse(resp);
  return (data.ltc_requests ?? []).map(normalizeInboxRow);
};

export const getLtcInbox = async () => {
  const resp = await fetch("/api/hr/ltc/inbox", { headers: authHeaders() });
  const data = await handleResponse(resp);
  return (data.ltc_inbox ?? []).map(normalizeInboxRow);
};

export const getLtcArchive = async () => {
  const resp = await fetch("/api/hr/ltc/archive", { headers: authHeaders() });
  const data = await handleResponse(resp);
  return (data.ltc_archive ?? []).map(normalizeInboxRow);
};

export const getLtcForm = async (id) => {
  const resp = await fetch(`/api/hr/ltc/form/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const getLtcTrack = async (id) => {
  const resp = await fetch(`/api/hr/ltc/track/${id}`, {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return data.file_history ?? [];
};

export const getLeaveRequests = async () => {
  const resp = await fetch("/api/hr/leave/requests", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.leave_requests ?? []).map(normalizeInboxRow);
};

export const getLeaveInbox = async () => {
  const resp = await fetch("/api/hr/leave/inbox", { headers: authHeaders() });
  const data = await handleResponse(resp);
  return (data.leave_inbox ?? []).map(normalizeInboxRow);
};

export const getLeaveArchive = async () => {
  const resp = await fetch("/api/hr/leave/archive", { headers: authHeaders() });
  const data = await handleResponse(resp);
  return (data.leave_archive ?? []).map(normalizeInboxRow);
};

export const getLeaveTrack = async (id) => {
  const resp = await fetch(`/api/hr/leave/track/${id}`, {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return data.file_history ?? [];
};

export const createLeaveForm = async (data) => {
  const resp = await fetch("/api/hr/leave/create", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(resp);
};

export const createLtcForm = async (formDataArray) => {
  const resp = await fetch("/hr2/api/ltc/", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formDataArray),
  });
  return handleResponse(resp);
};

export const getFormInitials = async () => {
  const resp = await fetch("/hr2/leave/form-initials/", {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const submitLeaveForm = async (formData) => {
  const resp = await fetch("/api/hr/leave/submit", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(resp);
};

export const getLeaveFormById = async (id) => {
  const resp = await fetch(`/api/hr/leave/form/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const downloadLeavePdf = async (id) => {
  const resp = await fetch(`/hr2/leave/pdf/${id}/`, {
    headers: authHeaders(),
  });
  if (!resp.ok) {
    throw new Error((await resp.text()) || resp.statusText);
  }
  return resp.blob();
};

export const getAdminLeaveRequests = async (userId, date = "") => {
  let url = `/api/hr/admin/leave/${userId}`;
  if (date) {
    url += `?date=${date}`;
  }

  const resp = await fetch(url, {
    headers: authHeaders(),
  });

  if (resp.status === 403) {
    throw new Error("403");
  }

  return handleResponse(resp);
};

export const handleLeaveFileAction = async (id, payload) => {
  const resp = await fetch(`/api/hr/leave/handle/${id}/`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(resp);
};

export const handleLeaveResponsibility = async (id, action, type) => {
  const url =
    type === "academic"
      ? `/api/hr/leave/academic/${id}/`
      : `/api/hr/leave/administrative/${id}/`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });

  return handleResponse(resp);
};

export const getLeaveBalance = async () => {
  const resp = await fetch("/hr2/leave/balance/", {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const getEmployeeInitials = async (employeeId) => {
  const resp = await fetch(`/api/hr/employee/${employeeId}`, {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const submitOfflineLeaveForm = async (formDataObj) => {
  const resp = await fetch("/api/hr/leave/offline", {
    method: "POST",
    headers: authHeaders(),
    body: formDataObj,
  });
  return handleResponse(resp);
};

export const getAllEmployeeLeaveBalances = async () => {
  const resp = await fetch("/api/hr/leave/all-balances", {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

// GET APIs
export const getCpdaClaimRequests = async () => {
  const resp = await fetch("/api/hr/cpda/claim/requests", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.cpda_claim_requests ?? []).map(normalizeInboxRow);
};

export const getCpdaClaimInbox = async () => {
  const resp = await fetch("/api/hr/cpda/claim/inbox", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.cpda_claim_inbox ?? []).map(normalizeInboxRow);
};

export const getCpdaClaimArchive = async () => {
  const resp = await fetch("/api/hr/cpda/claim/archive", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.cpda_claim_archive ?? []).map(normalizeInboxRow);
};

export const getCpdaClaimTrack = async (id) => {
  const resp = await fetch(`/api/hr/cpda/claim/track/${id}`, {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return data.file_history ?? [];
};

// POST
export const submitCpdaClaimForm = async (formData) => {
  const resp = await fetch("/api/hr/cpda/claim/submit", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  return handleResponse(resp);
};

// GET
export const getAppraisalRequests = async () => {
  const resp = await fetch("/api/hr/appraisal/requests", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.appraisal_requests ?? []).map(normalizeInboxRow);
};

export const getAppraisalInbox = async () => {
  const resp = await fetch("/api/hr/appraisal/inbox", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.appraisal_inbox ?? []).map(normalizeInboxRow);
};

export const getAppraisalArchive = async () => {
  const resp = await fetch("/api/hr/appraisal/archive", {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return (data.appraisal_archive ?? []).map(normalizeInboxRow);
};

export const getAppraisalTrack = async (id) => {
  const resp = await fetch(`/api/hr/appraisal/track/${id}`, {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return data.file_history ?? [];
};

// POST
export const submitAppraisalForm = async (formData) => {
  const resp = await fetch("/api/hr/appraisal/submit", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  return handleResponse(resp);
};

export const getOutbox = async (fromDate = "") => {
  const host = window.location.origin;
  let url = `${host}/hr2/api/getOutbox/`;
  if (fromDate) {
    url += `?from_date=${fromDate}`;
  }
  const resp = await fetch(url, {
    headers: authHeaders(),
  });
  const data = await handleResponse(resp);
  return data;
};
