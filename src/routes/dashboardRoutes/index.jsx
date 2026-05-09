import { host } from "../globalRoutes";

export const logoutRoute = `${host}/api/auth/logout/`;
export const updateRoleRoute = `${host}/api/update-role/`;
export const getNotificationsRoute = `${host}/api/notification/`;
export const notificationReadRoute = `${host}/api/notificationread`;
export const notificationDeleteRoute = `${host}/notification/api/notifications/{id}/`;
export const notificationUnreadRoute = `${host}/api/notificationunread`;
export const announcementCreateRoute = `${host}/notification/api/announcements/`;
export const announcementPublishRoute = `${host}/notification/api/announcements`;
export const getProfileDataRoute = `${host}/api/profile/`;
export const updateProfileDataRoute = `${host}/api/profile_update/`;
