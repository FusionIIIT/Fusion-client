/**
 * Notification Module Index
 * Exports all public components and utilities
 */

// Components
export { default as NotificationItem } from "./components/NotificationItem";
export { default as NotificationList } from "./components/NotificationList";
export { default as NotificationFilters } from "./components/NotificationFilters";

// Pages
export { default as NotificationsPage } from "./NotificationsPage";

// Hooks
export { useNotifications } from "./hooks/useNotifications";

// Services
export { notificationService } from "./services/notificationService";

// Utils
export * from "./utils/notificationUtils";

// Redux
export {
  setNotifications,
  setAnnouncements,
  setLoading,
  setError,
  setSortedBy,
  setActiveTab,
  setLoadingId,
  updateNotificationStatus,
  removeNotification,
  clearNotifications,
} from "./redux/notificationSlice";
export { default as notificationReducer } from "./redux/notificationSlice";
