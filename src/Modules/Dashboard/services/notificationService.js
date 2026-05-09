import axios from "axios";
import {
  notificationReadRoute,
  notificationDeleteRoute,
  notificationUnreadRoute,
  getNotificationsRoute,
} from "../../../routes/dashboardRoutes";
import { getAuthHeader } from "../utils/authHelpers";

const getRequestConfig = () => ({
  headers: getAuthHeader(),
});

export const fetchNotifications = () => {
  return axios.get(getNotificationsRoute, getRequestConfig());
};

export const markNotificationRead = (id) => {
  return axios.post(notificationReadRoute, { id }, getRequestConfig());
};

export const markNotificationUnread = (id) => {
  return axios.post(notificationUnreadRoute, { id }, getRequestConfig());
};

export const removeNotification = (id) => {
  return axios.post(notificationDeleteRoute, { id }, getRequestConfig());
};
