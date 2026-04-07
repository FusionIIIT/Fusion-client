import { useEffect, useState } from "react";
import { notificationAPI, notificationUtils } from "./api";

function Announcements() {
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(-1);

  // Fetch announcements on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await notificationAPI.fetchAll();
        const { announcements } = notificationUtils.separate(data);
        setAnnouncementsList(announcements);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mark as read
  const handleMarkAsRead = async (announcementId) => {
    try {
      setLoadingId(announcementId);
      await notificationAPI.markAsRead(announcementId);
      setAnnouncementsList((prev) =>
        prev.map((a) =>
          a.id === announcementId ? { ...a, unread: false } : a,
        ),
      );
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingId(-1);
    }
  };

  // Mark as unread
  const handleMarkAsUnread = async (announcementId) => {
    try {
      setLoadingId(announcementId);
      await notificationAPI.markAsUnread(announcementId);
      setAnnouncementsList((prev) =>
        prev.map((a) => (a.id === announcementId ? { ...a, unread: true } : a)),
      );
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingId(-1);
    }
  };

  // Delete announcement
  const handleDelete = async (announcementId) => {
    try {
      await notificationAPI.delete(announcementId);
      setAnnouncementsList((prev) =>
        prev.filter((a) => a.id !== announcementId),
      );
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return {
    announcementsList,
    setAnnouncementsList,
    loading,
    loadingId,
    markAsRead: handleMarkAsRead,
    markAsUnread: handleMarkAsUnread,
    deleteNotification: handleDelete,
  };
}

export default Announcements;
