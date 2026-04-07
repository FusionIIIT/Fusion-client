import axios from "axios";
import {
  notificationReadRoute,
  notificationDeleteRoute,
  notificationUnreadRoute,
  getNotificationsRoute,
} from "../../../routes/dashboardRoutes";

const getAuthToken = () => localStorage.getItem("authToken");

const getAuthHeaders = () => ({
  headers: { Authorization: `Token ${getAuthToken()}` },
});

export const notificationService = {
  /**
   * Fetch all notifications and announcements
   */
  fetchNotifications: async () => {
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

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.post(
        notificationReadRoute,
        { id: notificationId },
        getAuthHeaders(),
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark notification as unread
   */
  markAsUnread: async (notificationId) => {
    try {
      const response = await axios.post(
        notificationUnreadRoute,
        { id: notificationId },
        getAuthHeaders(),
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.post(
        notificationDeleteRoute,
        { id: notificationId },
        getAuthHeaders(),
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};
