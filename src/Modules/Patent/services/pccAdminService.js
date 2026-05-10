import apiClient, { authHeaders } from "./api";

export const fetchPccNewApplications = async () => {
  const response = await apiClient.get(
    "/pccAdmin/applications/new/",
    authHeaders(),
  );
  return response.data;
};

export const fetchPccPastApplications = async () => {
  const response = await apiClient.get(
    "/pccAdmin/applications/past/",
    authHeaders(),
  );
  return response.data;
};

export const fetchPccOngoingApplications = async () => {
  const response = await apiClient.get(
    "/pccAdmin/applications/ongoing/",
    authHeaders(),
  );
  return response.data;
};

export const fetchPccApplicationDetails = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/details/${applicationId}/`,
    authHeaders(),
  );
  return response.data;
};

export const fetchPccStatusDetails = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/status/details/${applicationId}/`,
    authHeaders(),
  );
  return response.data;
};

export const fetchPccAttorneys = async () => {
  const response = await apiClient.get("/pccAdmin/attorneys/", authHeaders());
  return response.data;
};

export const fetchPccDirectors = async () => {
  const response = await apiClient.get("/pccAdmin/directors/", authHeaders());
  return response.data;
};

export const reviewPccApplication = async (applicationId, comments = "") => {
  const response = await apiClient.post(
    `/pccAdmin/applications/new/review/${applicationId}/`,
    { comments },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const forwardPccApplicationToDirector = async (
  applicationId,
  attorneyName,
  directorUserId,
  budgetEstimate,
  comments,
) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/new/forward/${applicationId}/`,
    {
      attorney_name: attorneyName,
      director_user_id: directorUserId,
      budget_estimate: budgetEstimate,
      comments,
    },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const requestPccApplicationModification = async (
  applicationId,
  comments,
) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/new/requestModification/${applicationId}/`,
    { comments },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const updatePccOngoingApplicationStatus = async (
  applicationId,
  nextStatus,
) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/ongoing/changeStatus/${applicationId}/`,
    { next_status: nextStatus },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response;
};

export const fetchPccInsightsReport = async (year) => {
  const response = await apiClient.get("/pccAdmin/insights/", {
    ...authHeaders(),
    params: year ? { year } : {},
  });
  return response.data;
};

export const downloadPccInsightsCsv = async (year) => {
  const response = await apiClient.get("/pccAdmin/insights/", {
    ...authHeaders(),
    params: {
      ...(year ? { year } : {}),
      format: "csv",
    },
    responseType: "blob",
  });
  return response.data;
};

export const submitLegalAssessment = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/legal-assessment/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchLegalAssessments = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/legal-assessment/`,
    authHeaders(),
  );
  return response.data;
};

export const resubmitApplicationRevision = async (applicationId) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/new/resubmit/${applicationId}/`,
    {},
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const submitBudgetRequest = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/budget/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const decideBudgetRequest = async (budgetId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/budget/${budgetId}/decision/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const logExternalFiling = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/external-filing/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchExternalFilingRecords = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/external-filing/`,
    authHeaders(),
  );
  return response.data;
};

export const fetchMaintenanceSchedule = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/maintenance/`,
    authHeaders(),
  );
  return response.data;
};

export const markMaintenancePaid = async (scheduleId) => {
  const response = await apiClient.post(
    `/pccAdmin/maintenance/${scheduleId}/mark-paid/`,
    {},
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchSystemNotifications = async (role) => {
  const response = await apiClient.get("/notifications/", {
    ...authHeaders(),
    params: role ? { role } : {},
  });
  return response.data;
};

export const uploadDocumentVersion = async (documentId, payload) => {
  const response = await apiClient.post(
    `/documents/${documentId}/versions/upload/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchDocumentVersions = async (documentId) => {
  const response = await apiClient.get(
    `/documents/${documentId}/versions/`,
    authHeaders(),
  );
  return response.data;
};

export const setDocumentRevisionLock = async (documentId, isLocked) => {
  const response = await apiClient.post(
    `/documents/${documentId}/lock/`,
    { is_locked: isLocked },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchPrioritizedQueue = async () => {
  const response = await apiClient.get(
    "/pccAdmin/queue/prioritized/",
    authHeaders(),
  );
  return response.data;
};

export const fetchAuditLogs = async (applicationId) => {
  const path = applicationId ? `/audit-logs/${applicationId}/` : "/audit-logs/";
  const response = await apiClient.get(path, authHeaders());
  return response.data;
};

export const fetchOfficeActions = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/office-actions/`,
    authHeaders(),
  );
  return response.data;
};

export const createOfficeAction = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/office-actions/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const respondOfficeAction = async (actionId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/office-actions/${actionId}/respond/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchPriorArt = async (applicationId, query) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/prior-art/`,
    {
      ...authHeaders(),
      params: query ? { q: query } : {},
    },
  );
  return response.data;
};

export const createPriorArt = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/prior-art/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchAppeals = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/appeals/`,
    authHeaders(),
  );
  return response.data;
};

export const createAppeal = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/appeals/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchLicensingRequests = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/licensing/`,
    authHeaders(),
  );
  return response.data;
};

export const createLicensingRequest = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/licensing/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchInventorConsents = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/inventor-consents/`,
    authHeaders(),
  );
  return response.data;
};

export const createInventorConsent = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/inventor-consents/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchLegalMemos = async (applicationId) => {
  const response = await apiClient.get(
    `/pccAdmin/applications/${applicationId}/legal-memos/`,
    authHeaders(),
  );
  return response.data;
};

export const createLegalMemo = async (applicationId, payload) => {
  const response = await apiClient.post(
    `/pccAdmin/applications/${applicationId}/legal-memos/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};
