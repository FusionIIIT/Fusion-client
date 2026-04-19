import axios from "axios";
import { host } from "../../../routes/globalRoutes";

const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return { Authorization: `Token ${token}` };
};

export const getStudentProfile = () => {
  return axios.get(`${host}/scholarships/api/student-profile/`, {
    headers: authHeaders()
  });
};

export const getActiveAwards = () => {
  return axios.get(`${host}/scholarships/api/active-awards/`, {
    headers: authHeaders()
  });
};

export const submitMCMApplication = (payload) => {
  return axios.post(`${host}/scholarships/api/student/submit/mcm/`, payload, {
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    }
  });
};

export const getMCMApplications = (params = {}) => {
  return axios.get(`${host}/scholarships/api/mcm-applications/`, {
    headers: authHeaders(),
    params
  });
};

export const submitMCMLinkApplication = (payload) => {
  return axios.post(`${host}/scholarships/api/mcm-applications/`, payload, {
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    }
  });
};

export const updateMCMLinkApplication = (applicationId, payload) => {
  return axios.patch(`${host}/scholarships/api/mcm-applications/${applicationId}/`, payload, {
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    }
  });
};

export const getSingleParentApplications = (params = {}) => {
  return axios.get(`${host}/scholarships/api/single-parent-applications/`, {
    headers: authHeaders(),
    params
  });
};

export const submitSingleParentApplication = (payload) => {
  return axios.post(`${host}/scholarships/api/single-parent-applications/`, payload, {
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    }
  });
};

export const updateSingleParentApplication = (applicationId, payload) => {
  return axios.patch(`${host}/scholarships/api/single-parent-applications/${applicationId}/`, payload, {
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    }
  });
};

export const generateMeritList = (payload = {}) => {
  return axios.post(
    `${host}/scholarships/api/generate-merit-list/`,
    payload,
    {
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      }
    }
  );
};

export const getConvenorMcmMeritList = (params = {}) => {
  return axios.get(`${host}/scholarships/api/convenor/mcm-merit-list/`, {
    headers: authHeaders(),
    params
  });
};

