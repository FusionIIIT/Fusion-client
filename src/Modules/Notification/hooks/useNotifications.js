import { useEffect, useState } from "react";
import { notificationService } from "../services/notificationService";
import { separateNotifications } from "../utils/notificationUtils";

/**
 * Hook to fetch and manage notifications
 */
export const useNotifications = () => {
  const [notificationsList, setNotificationsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.fetchNotifications();
      const { notifications, announcements } = separateNotifications(data);
      setNotificationsList(notifications);
      setAnnouncementsList(announcements);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationStatus = (notifId, updates) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, ...updates } : n)),
    );
    setAnnouncementsList((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, ...updates } : n)),
    );
  };

  const removeNotification = (notifId) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== notifId));
    setAnnouncementsList((prev) => prev.filter((n) => n.id !== notifId));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      updateNotificationStatus(notifId, { unread: false });
    } catch (err) {
      console.error("Failed to mark as read:", err);
      throw err;
    }
  };

  const handleMarkAsUnread = async (notifId) => {
    try {
      await notificationService.markAsUnread(notifId);
      updateNotificationStatus(notifId, { unread: true });
    } catch (err) {
      console.error("Failed to mark as unread:", err);
      throw err;
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await notificationService.deleteNotification(notifId);
      removeNotification(notifId);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      throw err;
    }
  };

  return {
    notificationsList,
    announcementsList,
    loading,
    error,
    markAsRead: handleMarkAsRead,
    markAsUnread: handleMarkAsUnread,
    deleteNotification: handleDelete,
  };
};
