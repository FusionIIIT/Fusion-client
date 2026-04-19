// src/Modules/HR/services/hrApi.js
/** DRF Token auth (see globals API login — stores key in localStorage). */
const getToken = () => {
  try {
    const raw =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    const t = raw != null ? String(raw).trim() : "";
    return t || null;
  } catch {
    return null;
  }
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Token ${token}` } : {};
};

/** Same-origin + session cookie (DRF SessionAuthentication) when deployed behind one host. */
const fetchCredentials = "include";

const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    try {
      const body = JSON.parse(text);
      if (body && typeof body.detail === "string") {
        throw new Error(body.detail);
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        // not JSON; fall through to generic message
      } else {
        throw e;
      }
    }
    throw new Error(text || response.statusText);
  }
  return response.json();
};

/** Human-readable status for HR leave workflow (matches ``hr2.workflow.leave_wf``). */
export const leaveWorkflowDisplayLabel = (wf) => {
  const key = (wf || "").toString().trim().toLowerCase();
  const map = {
    submitted: "Submitted",
    hod_approved: "HOD approved (pending HR)",
    hod_rejected: "Rejected by HOD",
    hr_approved: "Approved by HR",
    hr_rejected: "Rejected by HR",
  };
  return map[key] || wf || "Pending";
};

const normalizeInboxRow = (item) => {
  const extra = item.file_extra_JSON || {};
  const isLeave = extra.type === "Leave" || extra.type === "leave";
  const wfRaw = extra.workflow_status || item.workflow_status || item.status;
  const status = isLeave ? leaveWorkflowDisplayLabel(wfRaw) : wfRaw || item.status || "Pending";
  return {
    ...item,
    ...extra,
    id: item.id || item.file_id,
    user: item.sent_by_user || item.uploader_name || item.user || item.name,
    name: item.sent_by_user || item.uploader_name || item.user || item.name,
    designation:
      item.sent_by_designation || item.designation_name || item.designation,
    date: item.upload_date || item.date || item.submissionDate,
    submissionDate: item.upload_date || item.date || item.submissionDate,
    status,
    workflow_status: wfRaw,
  };
};

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

/** CPDA Advance track: file routing history plus workflow_status / workflow_history. */
export const getCpdaAdvTrack = async (id) => {
  const resp = await fetch(`/api/hr/cpda_adv/track/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const handleCpdaAdvanceWorkflow = async (fileId, body) => {
  const resp = await fetch(`/api/hr/cpda_adv/handle/${fileId}/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(resp);
};

export const getMyDetailsHr = async () => {
  const resp = await fetch("/api/hr/get_my_details/", {
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
  return handleResponse(resp);
};

export const handleLtcWorkflow = async (fileId, body) => {
  const resp = await fetch(`/api/hr/ltc/handle/${fileId}/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(resp);
};

export const getLeaveRequests = async (fromDate) => {
  let url = "/api/hr/leave/my-requests";
  if (fromDate) {
    url += `?from_date=${encodeURIComponent(fromDate)}`;
  }
  const resp = await fetch(url, { headers: authHeaders() });
  const rows = await handleResponse(resp);
  const list = Array.isArray(rows) ? rows : [];
  return list.map((row) => ({
    ...row,
    submissionDate: row.submissionDate || "",
    status: leaveWorkflowDisplayLabel(row.workflow_status),
    workflow_status: row.workflow_status,
  }));
};

export const getLeaveInbox = async (fromDate) => {
  let url = "/api/hr/leave/inbox";
  if (fromDate) {
    url += `?from_date=${encodeURIComponent(fromDate)}`;
  }
  const resp = await fetch(url, { headers: authHeaders() });
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
  return handleResponse(resp);
};

export const getLeaveTypesForHr = async () => {
  const resp = await fetch("/api/hr/leave/types", { headers: authHeaders() });
  const data = await handleResponse(resp);
  return data.leave_types ?? [];
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
  const body = Array.isArray(formDataArray)
    ? { form_data: formDataArray[0], user_info: formDataArray[1] ?? {} }
    : formDataArray;
  const resp = await fetch("/api/hr/ltc/create", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse(resp);
};

export const getFormInitials = async () => {
  const resp = await fetch("/hr2/leave/form-initials/", {
    headers: authHeaders(),
    credentials: fetchCredentials,
  });
  return handleResponse(resp);
};

export const submitLeaveForm = async (formData) => {
  const headers = authHeaders();
  if (!headers.Authorization) {
    throw new Error(
      "You are not signed in (no API token). Open the Fusion login page, sign in, then try again."
    );
  }
  const resp = await fetch("/api/hr/leave/submit", {
    method: "POST",
    headers,
    credentials: fetchCredentials,
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

/** @param formPk Primary key of ``LeaveForm`` (not file-tracking id). */
export const downloadLeavePdf = async (formPk) => {
  const resp = await fetch(`/hr2/leave/pdf/${formPk}/`, {
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
    credentials: fetchCredentials,
  });
  return handleResponse(resp);
};

/** Applicant’s HR2 balances (same payload as ``getLeaveBalance``). Uses ``?name=`` for another user (e.g. HOD viewing a file). */
export const getLeaveBalanceForUser = async (username) => {
  const q = username
    ? `?name=${encodeURIComponent(username)}`
    : "";
  const resp = await fetch(`/hr2/leave/balance/${q}`, {
    headers: authHeaders(),
    credentials: fetchCredentials,
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
  return handleResponse(resp);
};

export const handleAppraisalWorkflow = async (fileId, body) => {
  const resp = await fetch(`/api/hr/appraisal/handle/${fileId}/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(resp);
};

export const getAppraisalForm = async (id) => {
  const resp = await fetch(`/api/hr/appraisal/form/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

export const getCpdaClaimForm = async (id) => {
  const resp = await fetch(`/api/hr/cpda_claim/form/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(resp);
};

// POST
export const submitAppraisalForm = async (formData) => {
  const body = Array.isArray(formData)
    ? { form_data: formData[0], user_info: formData[1] ?? {} }
    : formData;
  const resp = await fetch("/api/hr/appraisal/submit", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
