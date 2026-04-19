import axios from "axios";
import { host } from "../../../routes/globalRoutes";

const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return { Authorization: `Token ${token}` };
};

// ── Student ──────────────────────────────────────────────────────────────────
export const getAwardsStudentProfile = () =>
  axios.get(`${host}/awards/api/student-profile/`, { headers: authHeaders() });

export const getAutoAwards = () =>
  axios.get(`${host}/awards/api/auto-awards/`, { headers: authHeaders() });

export const getMyAwardApplications = () =>
  axios.get(`${host}/awards/api/student-applications/`, { headers: authHeaders() });

export const submitAwardApplication = (payload) =>
  axios.post(`${host}/awards/api/apply/`, payload, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });

// ── Assistant ─────────────────────────────────────────────────────────────────
export const generateAutoAwards = (batch) =>
  axios.post(
    `${host}/awards/api/generate-auto-awards/`,
    { batch },
    { headers: { ...authHeaders(), "Content-Type": "application/json" } }
  );

export const getAllAwardApplications = (params = {}) =>
  axios.get(`${host}/awards/api/applications/`, { headers: authHeaders(), params });

export const exportAutoAwards = (batch) =>
  axios.get(`${host}/awards/api/auto-awards/export/`, {
    headers: authHeaders(),
    params: { batch },
    responseType: "blob",
  });

export const exportAwardApplications = (award_type) =>
  axios.get(`${host}/awards/api/applications/export/`, {
    headers: authHeaders(),
    params: award_type ? { award_type } : {},
    responseType: "blob",
  });
