import { useEffect, useState } from "react";
import { notificationAPI, notificationUtils } from "./api";

function Notifications() {
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(-1);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await notificationAPI.fetchAll();
        const { notifications } = notificationUtils.separate(data);
        setNotificationsList(notifications);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mark as read
  const handleMarkAsRead = async (notifId) => {
    try {
      setLoadingId(notifId);
      await notificationAPI.markAsRead(notifId);
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n)),
      );
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingId(-1);
    }
  };

  // Mark as unread
  const handleMarkAsUnread = async (notifId) => {
    try {
      setLoadingId(notifId);
      await notificationAPI.markAsUnread(notifId);
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, unread: true } : n)),
      );
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingId(-1);
    }
  };

  // Delete notification
  const handleDelete = async (notifId) => {
    try {
      await notificationAPI.delete(notifId);
      setNotificationsList((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return {
    notificationsList,
    setNotificationsList,
    loading,
    loadingId,
    markAsRead: handleMarkAsRead,
    markAsUnread: handleMarkAsUnread,
    deleteNotification: handleDelete,
  };
}

export default Notifications;
