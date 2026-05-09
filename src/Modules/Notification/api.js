/**
 * api.js — Axios calls for the Notification module.
 * Every function reads the token from localStorage and talks to
 * the Django REST endpoints defined in notificationRoutes/index.jsx.
 */

import axios from "axios";
import {
  notificationsRoute,
  unreadNotificationsRoute,
  unreadCountRoute,
  markAllReadRoute,
  markAllUnreadRoute,
  deleteAllRoute,
  preferencesRoute,
  setPreferenceRoute,
  sendRoute,
  markReadRoute,
  markUnreadRoute,
  deleteOneRoute,
  byModuleRoute,
  notifyLeaveRoute,
  notifyMessRoute,
  notifyHostelRoute,
  notifyHealthcareRoute,
  notifyScholarshipRoute,
  notifyDeanPnDRoute,
  notifyDeanStudentsRoute,
  notifyDeanRSPCRoute,
  notifyGymkhanaVotingRoute,
  notifyGymkhanaSessionRoute,
  notifyGymkhanaEventRoute,
  notifyResearchRoute,
  notifyAssistantshipApprovedRoute,
  notifyAssistantshipFacultyRoute,
  notifyAssistantshipAcadRoute,
  notifyAssistantshipAccountsRoute,
  notifyComplaintRoute,
  notifyFileTrackingRoute,
  notifyPlacementRoute,
  notifyAcademicsRoute,
  notifyDepartmentRoute,
  // UC-NT-01
  eventTypesRoute,
  registerEventTypeRoute,
  eventTypeDetailRoute,
  // UC-NT-02
  triggerEventRoute,
  // Group send
  sendGroupRoute,
  // UC-NT-03
  announcementsRoute,
  allAnnouncementsRoute,
  broadcastRoute,
  // UC-NT-04
  openNotificationRoute,
} from "../../routes/notificationRoutes";

const authHeader = () => ({
  Authorization: `Token ${localStorage.getItem("authToken")}`,
});

// ── Selectors (GET) ──────────────────────────────────────────────────────────

export const fetchAllNotifications = async () => {
  const { data } = await axios.get(notificationsRoute, { headers: authHeader() });
  return data.notifications;
};

export const fetchUnreadNotifications = async () => {
  const { data } = await axios.get(unreadNotificationsRoute, { headers: authHeader() });
  return data;
};

export const fetchUnreadCount = async () => {
  const { data } = await axios.get(unreadCountRoute, { headers: authHeader() });
  return data.unread_count;
};

export const fetchNotificationsByModule = async (module) => {
  const { data } = await axios.get(byModuleRoute(module), { headers: authHeader() });
  return data.notifications;
};

export const fetchPreferences = async () => {
  const { data } = await axios.get(preferencesRoute, { headers: authHeader() });
  return data.preferences;
};

// ── Services (PATCH / POST / DELETE) ────────────────────────────────────────

export const markRead = async (id) => {
  const { data } = await axios.patch(markReadRoute(id), {}, { headers: authHeader() });
  return data;
};

export const markUnread = async (id) => {
  const { data } = await axios.patch(markUnreadRoute(id), {}, { headers: authHeader() });
  return data;
};

export const markAllRead = async () => {
  const { data } = await axios.patch(markAllReadRoute, {}, { headers: authHeader() });
  return data;
};

export const markAllUnread = async () => {
  const { data } = await axios.patch(markAllUnreadRoute, {}, { headers: authHeader() });
  return data;
};

export const deleteOne = async (id) => {
  const { data } = await axios.delete(deleteOneRoute(id), { headers: authHeader() });
  return data;
};

export const deleteAll = async () => {
  const { data } = await axios.delete(deleteAllRoute, { headers: authHeader() });
  return data;
};

export const setPreference = async (module, is_enabled) => {
  const { data } = await axios.post(
    setPreferenceRoute,
    { module, is_enabled },
    { headers: authHeader() },
  );
  return data.preference;
};

// ── Module-specific notification senders (POST) ──────────────────────────────

const post = (url, payload) =>
  axios.post(url, payload, { headers: authHeader() }).then((r) => r.data);

export const sendGeneric               = (payload) => post(sendRoute, payload);
export const sendGroupNotification     = (payload) => post(sendGroupRoute, payload);
export const notifyLeave               = (payload) => post(notifyLeaveRoute, payload);
export const notifyMess                = (payload) => post(notifyMessRoute, payload);
export const notifyHostel              = (payload) => post(notifyHostelRoute, payload);
export const notifyHealthcare          = (payload) => post(notifyHealthcareRoute, payload);
export const notifyScholarship         = (payload) => post(notifyScholarshipRoute, payload);
export const notifyDeanPnD             = (payload) => post(notifyDeanPnDRoute, payload);
export const notifyDeanStudents        = (payload) => post(notifyDeanStudentsRoute, payload);
export const notifyDeanRSPC            = (payload) => post(notifyDeanRSPCRoute, payload);
export const notifyGymkhanaVoting      = (payload) => post(notifyGymkhanaVotingRoute, payload);
export const notifyGymkhanaSession     = (payload) => post(notifyGymkhanaSessionRoute, payload);
export const notifyGymkhanaEvent       = (payload) => post(notifyGymkhanaEventRoute, payload);
export const notifyResearch            = (payload) => post(notifyResearchRoute, payload);
export const notifyAssistantshipApproved  = (payload) => post(notifyAssistantshipApprovedRoute, payload);
export const notifyAssistantshipFaculty   = (payload) => post(notifyAssistantshipFacultyRoute, payload);
export const notifyAssistantshipAcad      = (payload) => post(notifyAssistantshipAcadRoute, payload);
export const notifyAssistantshipAccounts  = (payload) => post(notifyAssistantshipAccountsRoute, payload);
export const notifyComplaint           = (payload) => post(notifyComplaintRoute, payload);
export const notifyFileTracking        = (payload) => post(notifyFileTrackingRoute, payload);
export const notifyPlacement           = (payload) => post(notifyPlacementRoute, payload);
export const notifyAcademics           = (payload) => post(notifyAcademicsRoute, payload);
export const notifyDepartment          = (payload) => post(notifyDepartmentRoute, payload);

// ── UC-NT-01: Event Type Registry ────────────────────────────────────────────

export const fetchEventTypes = async () => {
  const { data } = await axios.get(eventTypesRoute, { headers: authHeader() });
  return data.event_types;
};

export const fetchEventTypeDetail = async (eventId) => {
  const { data } = await axios.get(eventTypeDetailRoute(eventId), { headers: authHeader() });
  return data.event_type;
};

export const registerEventType = (payload) => post(registerEventTypeRoute, payload);

// ── UC-NT-02: Trigger notification via Event ID ───────────────────────────────

export const triggerEventNotification = (payload) => post(triggerEventRoute, payload);

// ── UC-NT-03: Announcements ───────────────────────────────────────────────────

export const fetchActiveAnnouncements = async () => {
  const { data } = await axios.get(announcementsRoute, { headers: authHeader() });
  return data.announcements;
};

export const fetchAllAnnouncements = async () => {
  const { data } = await axios.get(allAnnouncementsRoute, { headers: authHeader() });
  return data.announcements;
};

export const broadcastAnnouncement = (payload) => post(broadcastRoute, payload);

export const previewAudience = async (audienceType, audienceValue = "") => {
  const { data } = await axios.get(
    `/api/notifications/announcements/preview-audience/?audience_type=${audienceType}&audience_value=${encodeURIComponent(audienceValue)}`,
    { headers: authHeader() }
  );
  return data;
};

// ── UC-NT-04: Open notification (mark read + get deep link URL) ───────────────

export const openNotification = async (id) => {
  const { data } = await axios.get(openNotificationRoute(id), { headers: authHeader() });
  return data.url;
};
