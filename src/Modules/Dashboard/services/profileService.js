import axios from "axios";
import {
  getProfileDataRoute,
  updateProfileDataRoute,
} from "../../../routes/dashboardRoutes";
import { getAuthHeader } from "../utils/authHelpers";

const getRequestConfig = () => ({
  headers: getAuthHeader(),
});

export const fetchProfileData = (connectionRoute) => {
  const endpoint = connectionRoute || getProfileDataRoute;
  return axios.get(endpoint, getRequestConfig());
};

export const updateProfileSection = (payload) => {
  return axios.put(updateProfileDataRoute, payload, getRequestConfig());
};
