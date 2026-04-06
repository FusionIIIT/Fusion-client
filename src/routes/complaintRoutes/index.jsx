import { host } from "../globalRoutes";

export const COMPLAINT_FRONTEND_BASE = "/complaint";
export const COMPLAINT_API_BASE = `${host}/complaint/api`;

export const complaintApiRoutes = {
  list: `${COMPLAINT_API_BASE}/studentcomplain`,
  create: `${COMPLAINT_API_BASE}/newcomplain`,
  detail: (id) => `${COMPLAINT_API_BASE}/user/detail/${id}/`,
  update: (id) => `${COMPLAINT_API_BASE}/updatecomplain/${id}`,
  remove: (id) => `${COMPLAINT_API_BASE}/removecomplain/${id}`,
};
