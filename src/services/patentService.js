import axios from "axios";
import { host } from "../routes/globalRoutes";

const apiBase = `${host}/patentsystem`;

const authHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Token ${token}`,
      ...extraHeaders,
    },
  };
};

export const fetchApplicantApplications = async () => {
  const response = await axios.get(
    `${apiBase}/applicant/applications/`,
    authHeaders(),
  );
  return response.data.applications || [];
};

export const fetchApplicantApplicationDetails = async (applicationId) => {
  const response = await axios.get(
    `${apiBase}/applicant/applications/details/${applicationId}/`,
    authHeaders(),
  );
  return response.data;
};

export const fetchPccNewApplications = async () => {
  const response = await axios.get(
    `${apiBase}/pccAdmin/applications/new/`,
    authHeaders(),
  );
  return response.data.applications || {};
};

export const fetchPccOngoingApplications = async () => {
  const response = await axios.get(
    `${apiBase}/pccAdmin/applications/ongoing/`,
    authHeaders(),
  );
  return response.data.applications || {};
};

export const fetchPccPastApplications = async () => {
  const response = await axios.get(
    `${apiBase}/pccAdmin/applications/past/`,
    authHeaders(),
  );
  return response.data.applications || {};
};

export const fetchPccApplicationDetails = async (applicationId) => {
  const response = await axios.get(
    `${apiBase}/pccAdmin/applications/details/${applicationId}/`,
    authHeaders(),
  );
  return response.data;
};

export const fetchPccDirectors = async () => {
  const response = await axios.get(
    `${apiBase}/pccAdmin/directors/`,
    authHeaders(),
  );
  return response.data;
};

export const reviewPatentApplication = async (applicationId, comments) => {
  const response = await axios.post(
    `${apiBase}/pccAdmin/applications/new/review/${applicationId}/`,
    { comments },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const forwardPatentApplication = async (
  applicationId,
  attorneyName,
  attorneyEmail,
  directorUserId,
  comments,
) => {
  const response = await axios.post(
    `${apiBase}/pccAdmin/applications/new/forward/${applicationId}/`,
    {
      attorney_name: attorneyName,
      attorney_email: attorneyEmail,
      director_user_id: directorUserId,
      comments,
    },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const requestPatentModification = async (applicationId, comments) => {
  const response = await axios.post(
    `${apiBase}/pccAdmin/applications/new/requestModification/${applicationId}/`,
    { comments },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const updatePatentApplicationStatus = async (
  applicationId,
  nextStatus,
) => {
  const response = await axios.post(
    `${apiBase}/pccAdmin/applications/ongoing/changeStatus/${applicationId}/`,
    { next_status: nextStatus },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchDirectorNewApplications = async () => {
  const response = await axios.get(
    `${apiBase}/director/applications/new/`,
    authHeaders(),
  );
  return response.data.applications || {};
};

export const fetchDirectorReviewedApplications = async () => {
  const response = await axios.get(
    `${apiBase}/director/reviewedapplications`,
    authHeaders(),
  );
  return response.data.applications || {};
};

export const fetchDirectorApplicationDetails = async (applicationId) => {
  const response = await axios.post(
    `${apiBase}/director/application/details`,
    { application_id: applicationId },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const approveDirectorApplication = async (applicationId, comments) => {
  const response = await axios.post(
    `${apiBase}/director/application/accept`,
    { application_id: applicationId, comments },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const rejectDirectorApplication = async (applicationId) => {
  const response = await axios.post(
    `${apiBase}/director/application/reject`,
    { application_id: applicationId },
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};

export const fetchCommunicationLogs = async (applicationId) => {
  const response = await axios.get(
    `${apiBase}/pccAdmin/applications/${applicationId}/communication-logs/`,
    authHeaders(),
  );
  return response.data;
};

export const createCommunicationLog = async (applicationId, payload) => {
  const response = await axios.post(
    `${apiBase}/pccAdmin/applications/${applicationId}/communication-logs/`,
    payload,
    authHeaders({ "Content-Type": "application/json" }),
  );
  return response.data;
};
