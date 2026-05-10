import apiClient, { authHeaders } from "./api";

export const fetchApplicantApplications = async () => {
  const response = await apiClient.get(
    "/applicant/applications/",
    authHeaders(),
  );
  return response.data;
};

export const fetchApplicantApplicationDetails = async (applicationId) => {
  const response = await apiClient.get(
    `/applicant/applications/details/${applicationId}`,
    authHeaders(),
  );
  return response.data;
};

export const submitApplicantApplication = async (formData) => {
  const response = await apiClient.post(
    "/applicant/applications/submit/",
    formData,
    authHeaders({ "Content-Type": "multipart/form-data" }),
  );
  return response.data;
};

export const withdrawApplicantApplication = async (applicationId) => {
  const response = await apiClient.post(
    `/applicant/applications/${applicationId}/withdraw/`,
    {},
    authHeaders(),
  );
  return response.data;
};

export const resubmitApplicantApplication = async (applicationId) => {
  const response = await apiClient.post(
    `/applicant/applications/${applicationId}/resubmit/`,
    {},
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};
