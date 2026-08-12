import { host } from "../globalRoutes";

export const logoutRoute = `${host}/api/auth/logout/`;
export const updateRoleRoute = `${host}/api/update-role/`;
export const getNotificationsRoute = `${host}/api/notification/`;
export const unreadNotificationCountRoute = `${host}/api/notification/unread-count/`;
export const notificationReadRoute = `${host}/api/notificationread`;
export const notificationDeleteRoute = `${host}/api/notificationdelete`;
export const notificationClearRoute = `${host}/api/notificationclear`;
export const notificationUnreadRoute = `${host}/api/notificationunread`;
export const getProfileDataRoute = `${host}/api/profile/`;
export const updateProfileDataRoute = `${host}/api/profile_update/`;
export const createAnnouncementRoute = `${host}/api/announcements/create/`;
export const announcementAudienceOptionsRoute = `${host}/api/announcements/audience-options/`;
export const announcementSearchUsersRoute = `${host}/api/announcements/search-users/`;
