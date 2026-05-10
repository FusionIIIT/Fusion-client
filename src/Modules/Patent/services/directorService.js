import apiClient, { authHeaders } from "./api";

export const fetchDirectorReviewedApplications = async () => {
  const response = await apiClient.get(
    "/director/reviewedapplications",
    authHeaders(),
  );
  return response.data;
};

export const fetchDirectorSubmittedApplications = async () => {
  const response = await apiClient.get(
    "/director/applications/new/",
    authHeaders(),
  );
  return response.data;
};

export const fetchDirectorApplicationDetails = async (applicationId) => {
  const response = await apiClient.post(
    "/director/application/details",
    { application_id: applicationId },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const approveDirectorApplication = async (applicationId, comments) => {
  const response = await apiClient.post(
    "/director/application/accept",
    {
      application_id: applicationId,
      comments,
    },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const rejectDirectorApplication = async (applicationId, comments) => {
  const response = await apiClient.post(
    "/director/application/reject",
    { application_id: applicationId, comments },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchAvailableAttorneys = async () => {
  const response = await apiClient.get("/pccAdmin/attorneys/", authHeaders());
  return response.data;
};

export const fetchDirectorInsightsReport = async (year) => {
  const response = await apiClient.get("/director/insights/", {
    ...authHeaders(),
    params: year ? { year } : {},
  });
  return response.data;
};

export const downloadDirectorInsightsCsv = async (year) => {
  const response = await apiClient.get("/director/insights/", {
    ...authHeaders(),
    params: {
      ...(year ? { year } : {}),
      format: "csv",
    },
    responseType: "blob",
  });
  return response.data;
};
