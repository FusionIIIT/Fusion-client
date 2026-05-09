import axios from "axios";
import {
  notificationReadRoute,
  notificationDeleteRoute,
  notificationUnreadRoute,
  getNotificationsRoute,
} from "../../routes/dashboardRoutes";

const getAuthToken = () => localStorage.getItem("authToken");

const getAuthHeaders = () => ({
  headers: { Authorization: `Token ${getAuthToken()}` },
});

/**
 * Notification API instance
 * All backend communication for notifications
 */
export const notificationAPI = {
  fetchAll: async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found!");
      const { data } = await axios.get(getNotificationsRoute, getAuthHeaders());
      return data.notifications || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      return await axios.post(
        notificationReadRoute,
        { id: notificationId },
        getAuthHeaders(),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
      throw error;
    }
  },

  markAsUnread: async (notificationId) => {
    try {
      return await axios.post(
        notificationUnreadRoute,
        { id: notificationId },
        getAuthHeaders(),
      );
    } catch (error) {
      console.error("Error marking as unread:", error);
      throw error;
    }
  },

  delete: async (notificationId) => {
    try {
      return await axios.delete(
        notificationDeleteRoute.replace("{id}", notificationId),
        getAuthHeaders(),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};

/**
 * Utility functions for notification data
 */
export const notificationUtils = {
  isAnnouncement: (notification) =>
    notification?.data?.flag === "announcement" ||
    notification?.data?.type === "announcement",

  parseData: (notification) => ({
    ...notification,
    data:
      typeof notification.data === "string"
        ? JSON.parse(notification.data.replace(/'/g, '"'))
        : notification.data,
  }),

  separate: (notifications) => {
    const parsed = notifications.map(notificationUtils.parseData);
    return {
      notifications: parsed.filter((n) => !notificationUtils.isAnnouncement(n)),
      announcements: parsed.filter((n) => notificationUtils.isAnnouncement(n)),
    };
  },

  sort: (notifications, sortBy) => {
    const sortMap = {
      "Most Recent": (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      Tags: (a, b) =>
        (a.data?.module || "").localeCompare(b.data?.module || ""),
      Title: (a, b) => (a.verb || "").localeCompare(b.verb || ""),
    };
    const sortFn = sortMap[sortBy] || sortMap["Most Recent"];
    return [...notifications].sort(sortFn);
  },

  getUnreadCount: (notifications) =>
    notifications.filter((n) => !n.deleted && n.unread).length,

  filterActive: (notifications) => notifications.filter((n) => !n.deleted),
};
