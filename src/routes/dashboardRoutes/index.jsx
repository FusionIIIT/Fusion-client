import { host } from "../globalRoutes";

export const logoutRoute = `${host}/api/auth/logout/`;
export const updateRoleRoute = `${host}/api/update-role/`;
export const getNotificationsRoute = `${host}/api/notifications/`;
export const notificationsBaseRoute = `${host}/api/notifications/`;
export const getProfileDataRoute = `${host}/api/profile/`;
export const updateProfileDataRoute = `${host}/api/profile_update/`;

// Per-notification action endpoints (new NAM API)
export const notificationReadRoute = (id) =>
  `${host}/api/notifications/${id}/mark-read/`;
export const notificationUnreadRoute = (id) =>
  `${host}/api/notifications/${id}/mark-unread/`;
export const notificationDeleteRoute = (id) =>
  `${host}/api/notifications/${id}/delete/`;
export const notificationStarRoute = (id) =>
  `${host}/api/notifications/${id}/star/`;

// Bulk actions
export const markAllReadRoute   = `${host}/api/notifications/mark-all-read/`;
export const markAllUnreadRoute = `${host}/api/notifications/mark-all-unread/`;
export const deleteAllRoute     = `${host}/api/notifications/delete-all/`;
