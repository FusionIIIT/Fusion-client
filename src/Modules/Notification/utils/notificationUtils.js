/**
 * Parse notification data from JSON string
 */
export const parseNotificationData = (notification) => ({
  ...notification,
  data:
    typeof notification.data === "string"
      ? JSON.parse(notification.data.replace(/'/g, '"'))
      : notification.data,
});

export const isAnnouncementNotification = (notification) =>
  notification?.data?.flag === "announcement" ||
  notification?.data?.type === "announcement";

/**
 * Separate notifications into regular notifications and announcements
 */
export const separateNotifications = (notifications) => {
  const parsed = notifications.map(parseNotificationData);
  return {
    notifications: parsed.filter((n) => !isAnnouncementNotification(n)),
    announcements: parsed.filter((n) => isAnnouncementNotification(n)),
  };
};

/**
 * Get unread count for a list of notifications
 */
export const getUnreadCount = (notifications) =>
  notifications.filter((n) => !n.deleted && n.unread).length;

/**
 * Sort notifications based on category
 */
export const sortNotifications = (notifications, sortBy) => {
  const sortMap = {
    "Most Recent": (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    Tags: (a, b) => (a.data?.module || "").localeCompare(b.data?.module || ""),
    Title: (a, b) => (a.verb || "").localeCompare(b.verb || ""),
  };

  const sortFn = sortMap[sortBy] || sortMap["Most Recent"];
  return [...notifications].sort(sortFn);
};

/**
 * Filter active notifications (not deleted)
 */
export const filterActiveNotifications = (notifications) =>
  notifications.filter((n) => !n.deleted);
