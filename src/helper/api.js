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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops if refresh endpoint itself returns 401
    if (originalRequest?.url?.includes("/api/token/refresh/")) {
      return Promise.reject(error);
    }

    // IF 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefresh();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Try to refresh the token
        const res = await axios.post(`${host}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        tokenStorage.setTokens({ access: res.data.access });

        // Explicitly inject the new token for the retry
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        tokenStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
