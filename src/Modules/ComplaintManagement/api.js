import axios from "axios";
import { COMPLAINT_API_BASE } from "../../routes/complaintRoutes";

const complaintApi = axios.create({
  baseURL: COMPLAINT_API_BASE,
});

complaintApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default complaintApi;
