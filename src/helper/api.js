import axios from "axios";
import { host } from "../routes/globalRoutes/host";
import { tokenStorage } from "./tokenStorage";

const api = axios.create({
  baseURL: host,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the access token
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccess();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If 401 (Unauthorized), clear tokens and redirect to login
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
