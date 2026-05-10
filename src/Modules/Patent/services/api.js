import axios from "axios";
import { host } from "../../../routes/globalRoutes/index.jsx";

export const API_BASE_URL = `${host}/patentsystem`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getAuthToken = () => localStorage.getItem("authToken");

export const authHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Token ${token}`,
      ...extraHeaders,
    },
  };
};

export default apiClient;
