import { host } from "../globalRoutes";

export const logoutRoute = `${host}/api/auth/logout/`;
export const updateRoleRoute = `${host}/api/update-role/`;
export const getNotificationsRoute = `${host}/api/notification/`;
export const notificationReadRoute = `${host}/api/notificationread`;
export const notificationDeleteRoute = `${host}/api/notificationdelete`;
export const notificationUnreadRoute = `${host}/api/notificationunread`;
export const getProfileDataRoute = `${host}/api/profile/`;
export const updateProfileDataRoute = `${host}/api/profile_update/`;
export const dbIssuesRoute = `${host}/api/db/issues/`;
export const dbIssueSupportRoute = (issueId) => `${host}/api/db/issues/${issueId}/support/`;
export const dbIssueUpdateRoute = (issueId) => `${host}/api/db/issues/${issueId}/`;
export const dbFeedbackRoute = `${host}/api/db/feedback/`;
export const dbSearchRoute = `${host}/api/db/search/`;
