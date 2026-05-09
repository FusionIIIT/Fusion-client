import { host } from "../globalRoutes";

export const notificationsRoute        = `${host}/api/notifications/`;
export const unreadNotificationsRoute  = `${host}/api/notifications/unread/`;
export const unreadCountRoute          = `${host}/api/notifications/unread-count/`;
export const markAllReadRoute          = `${host}/api/notifications/mark-all-read/`;
export const markAllUnreadRoute        = `${host}/api/notifications/mark-all-unread/`;
export const deleteAllRoute            = `${host}/api/notifications/delete-all/`;
export const preferencesRoute          = `${host}/api/notifications/preferences/`;
export const setPreferenceRoute        = `${host}/api/notifications/preferences/set/`;
export const sendRoute                 = `${host}/api/notifications/send/`;
export const sendGroupRoute            = `${host}/api/notifications/send-group/`;

export const markReadRoute   = (id) => `${host}/api/notifications/${id}/mark-read/`;
export const markUnreadRoute = (id) => `${host}/api/notifications/${id}/mark-unread/`;
export const deleteOneRoute  = (id) => `${host}/api/notifications/${id}/delete/`;
export const byModuleRoute   = (mod) => `${host}/api/notifications/module/${mod}/`;

// Module-specific send endpoints
export const notifyLeaveRoute                  = `${host}/api/notifications/notify/leave/`;
export const notifyMessRoute                   = `${host}/api/notifications/notify/mess/`;
export const notifyHostelRoute                 = `${host}/api/notifications/notify/hostel/`;
export const notifyHealthcareRoute             = `${host}/api/notifications/notify/healthcare/`;
export const notifyScholarshipRoute            = `${host}/api/notifications/notify/scholarship/`;
export const notifyDeanPnDRoute                = `${host}/api/notifications/notify/dean-pnd/`;
export const notifyDeanStudentsRoute           = `${host}/api/notifications/notify/dean-students/`;
export const notifyDeanRSPCRoute               = `${host}/api/notifications/notify/dean-rspc/`;
export const notifyGymkhanaVotingRoute         = `${host}/api/notifications/notify/gymkhana/voting/`;
export const notifyGymkhanaSessionRoute        = `${host}/api/notifications/notify/gymkhana/session/`;
export const notifyGymkhanaEventRoute          = `${host}/api/notifications/notify/gymkhana/event/`;
export const notifyResearchRoute               = `${host}/api/notifications/notify/research/`;
export const notifyAssistantshipApprovedRoute  = `${host}/api/notifications/notify/assistantship/approved/`;
export const notifyAssistantshipFacultyRoute   = `${host}/api/notifications/notify/assistantship/faculty/`;
export const notifyAssistantshipAcadRoute      = `${host}/api/notifications/notify/assistantship/acad/`;
export const notifyAssistantshipAccountsRoute  = `${host}/api/notifications/notify/assistantship/accounts/`;
export const notifyComplaintRoute              = `${host}/api/notifications/notify/complaint/`;
export const notifyFileTrackingRoute           = `${host}/api/notifications/notify/file-tracking/`;
export const notifyPlacementRoute              = `${host}/api/notifications/notify/placement/`;
export const notifyAcademicsRoute              = `${host}/api/notifications/notify/academics/`;
export const notifyDepartmentRoute             = `${host}/api/notifications/notify/department/`;

// UC-NT-01: Event Type Registry
export const eventTypesRoute          = `${host}/api/notifications/event-types/`;
export const registerEventTypeRoute   = `${host}/api/notifications/event-types/register/`;
export const eventTypeDetailRoute     = (eventId) => `${host}/api/notifications/event-types/${eventId}/`;

// UC-NT-02: Trigger via Event ID
export const triggerEventRoute        = `${host}/api/notifications/trigger/`;

// UC-NT-03: Announcements
export const announcementsRoute       = `${host}/api/notifications/announcements/`;
export const allAnnouncementsRoute    = `${host}/api/notifications/announcements/all/`;
export const broadcastRoute           = `${host}/api/notifications/announcements/broadcast/`;

// UC-NT-04: Deep link open (mark read + return URL)
export const openNotificationRoute    = (id) => `${host}/api/notifications/${id}/open/`;
