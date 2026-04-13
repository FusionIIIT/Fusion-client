import axios from "axios";
import {
  getNotificationsRoute,
  notificationDeleteRoute,
  notificationReadRoute,
  notificationUnreadRoute,
} from "../../routes/dashboardRoutes";
import { normalizeNotification } from "./utils";

const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
};

export const fetchNotifications = async () => {
  const { data } = await axios.get(getNotificationsRoute, authHeaders());
  const notifications = data?.notifications || [];
  return notifications.map(normalizeNotification);
};

export const markNotificationRead = async (notificationId) => {
  const response = await axios.post(
    notificationReadRoute,
    { id: notificationId },
    authHeaders(),
  );
  return response.data;
};

export const markNotificationUnread = async (notificationId) => {
  const response = await axios.post(
    notificationUnreadRoute,
    { id: notificationId },
    authHeaders(),
  );
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await axios.post(
    notificationDeleteRoute,
    { id: notificationId },
    authHeaders(),
  );
  return response.data;
};

export const markVisibleNotificationsRead = async (notifications) => {
  const unreadIds = notifications
    .filter((notification) => notification.unread && !notification.deleted)
    .map((notification) => notification.id);

  await Promise.all(unreadIds.map((id) => markNotificationRead(id)));
  return unreadIds.length;
};
