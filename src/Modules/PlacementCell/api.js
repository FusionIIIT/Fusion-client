import axios from "axios";
import { host } from "../../routes/globalRoutes";
import {
  buildAuthConfig,
  buildAuthHeaders,
  getCsrfToken,
} from "./utils/helpers";

// A clean, human-readable message for an HTTP status, used when the server
// returns a non-JSON body (e.g. a Django DEBUG 404/500 HTML page) that must
// never be shown to a user verbatim.
function messageForStatus(status) {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "This placement service is unavailable. Please try again later.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "The placement service is temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// Dedicated axios instance for the placement module. Its response interceptor
// guarantees that components (which read error.response.data.detail) always
// receive a clean message instead of raw HTML or an empty body — so a backend
// 404/500 can never dump Django's debug page into a toast.
const client = axios.create();

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      const isHtml =
        typeof data === "string" &&
        /<\s*(!doctype|html|head|body|pre)\b/i.test(data);
      const isBlank =
        data == null || (typeof data === "string" && data.trim() === "");
      if (isHtml || isBlank) {
        error.response.data = { detail: messageForStatus(status) };
      }
    } else {
      // No response at all: network failure, timeout, DNS/CORS, etc.
      error.response = {
        data: {
          detail:
            "Cannot reach the placement service. Check your connection and try again.",
        },
      };
    }
    return Promise.reject(error);
  },
);

const addPlacementEventForm = `${host}/placement/api/placement/`;
const fetchApplicationsRoute = `${host}/placement/api/student-applications/`;
const handleStatusChangeRoute = `${host}/placement/api/student-applications/`;
const applicationDetailRoute = `${host}/placement/api/application-detail/`;
const offerRoute = `${host}/placement/api/offer/`;
const downloadExcelRoute = `${host}/placement/api/download-applications/`;
const submitNextRoundDetailsRoute = `${host}/placement/api/nextround/`;
const downloadCVRoute = `${host}/placement/api/generate-cv/`;
const calendarEventsRoute = `${host}/placement/api/calender/`;
const fetchPlacementStatsRoute = `${host}/placement/api/statistics/`;
const placementReportsRoute = `${host}/placement/api/reports/`;
const placementReportsExportRoute = `${host}/placement/api/reports/export/`;
const placementReportSchedulesRoute = `${host}/placement/api/report-schedules/`;
const deletePlacementStatsRoute = `${host}/placement/api/delete-statistics/`;
const higherStudiesRoute = `${host}/placement/api/higher-studies/`;
const fetchPlacementScheduleRoute = `${host}/placement/api/placement/`;
const fetchTimeLineRoute = `${host}/placement/api/timeline/`;
const fetchDebaredlistRoute = `${host}/placement/api/debared-students/`;
const debarredStatusRoute = `${host}/placement/api/debared-status/`;
const fetchFieldsSubmitformRoute = `${host}/placement/api/add-field/`;
const fetchRestrictionsRoute = `${host}/placement/api/restrictions/`;
const fetchRegistrationRoute = `${host}/placement/api/registration/`;
const ApplyForPlacementRoute = `${host}/placement/api/apply-for-placement/`;
const myApplicationsRoute = `${host}/placement/api/my-applications/`;
const myOffersRoute = `${host}/placement/api/my-offers/`;
const fetchFormFieldsRoute = `${host}/placement/api/form-fields/`;
const sendNotificationRoute = `${host}/placement/api/send-notification/`;
const placementPoliciesRoute = `${host}/placement/api/policies/`;
const placementProfileRoute = `${host}/placement/api/profile/`;
const notificationPreferencesRoute = `${host}/placement/api/notification-preferences/`;
const placementAppealsRoute = `${host}/placement/api/placement-appeals/`;
const alumniProfileRoute = `${host}/placement/api/alumni/profile/`;
const alumniDirectoryRoute = `${host}/placement/api/alumni/directory/`;
const alumniVerificationRoute = `${host}/placement/api/alumni/verification/`;
const alumniReferralsRoute = `${host}/placement/api/alumni/referrals/`;
const alumniConnectionsRoute = `${host}/placement/api/alumni/connections/`;
const alumniSessionsRoute = `${host}/placement/api/alumni/sessions/`;
const placementAnnouncementsRoute = `${host}/placement/api/announcements/`;
const offCampusPlacementsRoute = `${host}/placement/api/offcampus/`;
const cpiBatchesRoute = `${host}/placement/api/cpi-batches/`;
const cpiStudentsRoute = `${host}/placement/api/cpi-students/`;
const placementBranchesRoute = `${host}/placement/api/branches/`;
const calendarEventsCrudRoute = `${host}/placement/api/calendar-events/`;

export const placementApi = {
  getOfferDetail(offerId) {
    return client.get(`${offerRoute}${offerId}/`, buildAuthConfig());
  },

  respondToOffer(offerId, action) {
    return client.post(
      `${offerRoute}${offerId}/respond/`,
      { action },
      buildAuthConfig({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  },

  getPlacementSchedule(params = {}) {
    return client.get(fetchPlacementScheduleRoute, buildAuthConfig({ params }));
  },

  getPlacementDetail(jobId) {
    return client.get(`${addPlacementEventForm}${jobId}/`, buildAuthConfig());
  },

  createPlacementEvent(formData) {
    return client.post(
      addPlacementEventForm,
      formData,
      buildAuthConfig({
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },

  updatePlacementEvent(jobId, payload) {
    return fetch(`${addPlacementEventForm}${jobId}/`, {
      method: "PUT",
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
    });
  },

  deletePlacementEvent(jobId) {
    return fetch(`${addPlacementEventForm}${jobId}/`, {
      method: "DELETE",
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
      }),
    });
  },

  applyForPlacement(payload) {
    return fetch(ApplyForPlacementRoute, {
      method: "POST",
      headers: buildAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
    });
  },

  getApplications(jobId) {
    return client.get(`${fetchApplicationsRoute}${jobId}/`, buildAuthConfig());
  },

  getApplicationDetail(applicationId) {
    return client.get(
      `${applicationDetailRoute}${applicationId}/`,
      buildAuthConfig(),
    );
  },

  getMyApplications() {
    return client.get(myApplicationsRoute, buildAuthConfig());
  },

  getMyOffers() {
    return client.get(myOffersRoute, buildAuthConfig());
  },

  updateApplicationStatus(applicationId, status) {
    return client.put(
      `${handleStatusChangeRoute}${applicationId}/`,
      { status },
      buildAuthConfig({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  },

  updateApplicationDetail(applicationId, payload) {
    return client.put(
      `${applicationDetailRoute}${applicationId}/`,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  },

  scheduleApplicationInterview(applicationId, payload) {
    return client.post(
      `${applicationDetailRoute}${applicationId}/interview/`,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  },

  deleteApplication(applicationId) {
    return client.delete(
      `${handleStatusChangeRoute}${applicationId}/`,
      buildAuthConfig(),
    );
  },

  downloadApplicationsExcel(jobId) {
    return client.get(
      `${downloadExcelRoute}${jobId}/`,
      buildAuthConfig({
        responseType: "blob",
      }),
    );
  },

  submitNextRoundDetails(jobId, payload) {
    return client.post(
      `${submitNextRoundDetailsRoute}${jobId}/`,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  },

  getTimeline(jobId) {
    return client.get(`${fetchTimeLineRoute}${jobId}/`, buildAuthConfig());
  },

  getPlacementAppeals() {
    return client.get(placementAppealsRoute, buildAuthConfig());
  },

  createPlacementAppeal(payload) {
    return client.post(placementAppealsRoute, payload, buildAuthConfig());
  },

  updatePlacementAppeal(appealId, payload) {
    return client.put(
      `${placementAppealsRoute}${appealId}/`,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  },

  getRegistrationList() {
    return client.get(fetchRegistrationRoute, buildAuthConfig());
  },

  createCompanyRegistration(payload) {
    return client.post(
      fetchRegistrationRoute,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },

  getCalendarEvents() {
    return client.get(calendarEventsRoute, buildAuthConfig());
  },

  getFields() {
    return client.get(fetchFieldsSubmitformRoute, buildAuthConfig());
  },

  createField(payload) {
    return client.post(fetchFieldsSubmitformRoute, payload, buildAuthConfig());
  },

  getPlacementStatistics() {
    return client.get(fetchPlacementStatsRoute, buildAuthConfig());
  },

  getPlacementReport(params = {}) {
    return client.get(placementReportsRoute, buildAuthConfig({ params }));
  },

  exportPlacementReport(params = {}, format = "excel") {
    return client.get(
      placementReportsExportRoute,
      buildAuthConfig({
        params: { ...params, export_format: format },
        responseType: "blob",
      }),
    );
  },

  getPlacementReportSchedules() {
    return client.get(placementReportSchedulesRoute, buildAuthConfig());
  },

  createPlacementReportSchedule(payload) {
    return client.post(
      placementReportSchedulesRoute,
      payload,
      buildAuthConfig(),
    );
  },

  updatePlacementReportSchedule(scheduleId, payload) {
    return client.put(
      `${placementReportSchedulesRoute}${scheduleId}/`,
      payload,
      buildAuthConfig(),
    );
  },

  deletePlacementReportSchedule(scheduleId) {
    return client.delete(
      `${placementReportSchedulesRoute}${scheduleId}/`,
      buildAuthConfig(),
    );
  },

  createPlacementStatistic(formData) {
    return fetch(fetchPlacementStatsRoute, {
      method: "POST",
      body: formData,
      headers: buildAuthHeaders(),
    });
  },

  deletePlacementStatistic(id) {
    return client.delete(
      `${deletePlacementStatsRoute}${id}/`,
      buildAuthConfig(),
    );
  },

  getHigherStudiesRecords() {
    return client.get(higherStudiesRoute, buildAuthConfig());
  },

  createHigherStudiesRecord(payload) {
    return client.post(higherStudiesRoute, payload, buildAuthConfig());
  },

  updateHigherStudiesRecord(id, payload) {
    return client.put(
      `${higherStudiesRoute}${id}/`,
      payload,
      buildAuthConfig(),
    );
  },

  deleteHigherStudiesRecord(id) {
    return client.delete(`${higherStudiesRoute}${id}/`, buildAuthConfig());
  },

  downloadCv(payload) {
    return client.post(
      downloadCVRoute,
      payload,
      buildAuthConfig({
        headers: {
          "X-CSRFToken": getCsrfToken(),
        },
        responseType: "blob",
      }),
    );
  },

  getPlacementProfile() {
    return client.get(placementProfileRoute, buildAuthConfig());
  },

  savePlacementProfile(payload) {
    return client.put(
      placementProfileRoute,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },

  uploadPlacementProfileDocument(payload) {
    return client.post(
      placementProfileRoute,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },

  getNotificationPreferences() {
    return client.get(notificationPreferencesRoute, buildAuthConfig());
  },

  updateNotificationPreferences(payload) {
    return client.put(notificationPreferencesRoute, payload, buildAuthConfig());
  },

  getDebarredStudents() {
    return client.get(fetchDebaredlistRoute, buildAuthConfig());
  },

  getDebarredStatus(rollNumber) {
    return client.get(
      `${debarredStatusRoute}${rollNumber}/`,
      buildAuthConfig(),
    );
  },

  removeDebarredStatus(rollNumber) {
    return client.delete(
      `${debarredStatusRoute}${rollNumber}/`,
      buildAuthConfig(),
    );
  },

  debarStudent(rollNumber, payload) {
    return client.post(
      `${debarredStatusRoute}${rollNumber}/`,
      payload,
      buildAuthConfig(),
    );
  },

  sendNotification(payload) {
    return client.post(sendNotificationRoute, payload, buildAuthConfig());
  },

  getPlacementPolicies() {
    return client.get(placementPoliciesRoute, buildAuthConfig());
  },

  createPlacementPolicy(payload) {
    return client.post(placementPoliciesRoute, payload, buildAuthConfig());
  },

  updatePlacementPolicy(policyId, payload) {
    return client.put(
      `${placementPoliciesRoute}${policyId}/`,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  },

  getFormFields(jobId) {
    return client.get(
      fetchFormFieldsRoute,
      buildAuthConfig({
        params: { jobId },
      }),
    );
  },

  submitPlacementResponses(jobId, responses) {
    return client.post(
      ApplyForPlacementRoute,
      { jobId, responses },
      buildAuthConfig(),
    );
  },

  withdrawApplication(jobId) {
    return client.delete(
      `${ApplyForPlacementRoute}${jobId}/`,
      buildAuthConfig(),
    );
  },

  getRestrictions() {
    return client.get(fetchRestrictionsRoute, buildAuthConfig());
  },

  createRestriction(payload) {
    return client.post(fetchRestrictionsRoute, payload, buildAuthConfig());
  },

  updateRestriction(id, payload) {
    return client.put(
      `${fetchRestrictionsRoute}${id}/`,
      payload,
      buildAuthConfig(),
    );
  },

  deleteRestriction(id) {
    return client.delete(`${fetchRestrictionsRoute}${id}/`, buildAuthConfig());
  },

  getAlumniProfile() {
    return client.get(alumniProfileRoute, buildAuthConfig());
  },

  saveAlumniProfile(payload) {
    return client.post(
      alumniProfileRoute,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },

  updateAlumniProfile(payload) {
    return client.put(
      alumniProfileRoute,
      payload,
      buildAuthConfig({
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },

  getAlumniDirectory(params) {
    return client.get(alumniDirectoryRoute, buildAuthConfig({ params }));
  },

  getAlumniVerificationQueue() {
    return client.get(alumniVerificationRoute, buildAuthConfig());
  },

  updateAlumniVerification(profileId, payload) {
    return client.put(
      `${alumniVerificationRoute}${profileId}/`,
      payload,
      buildAuthConfig(),
    );
  },

  getAlumniReferrals() {
    return client.get(alumniReferralsRoute, buildAuthConfig());
  },

  createAlumniReferral(payload) {
    return client.post(alumniReferralsRoute, payload, buildAuthConfig());
  },

  getAlumniConnections() {
    return client.get(alumniConnectionsRoute, buildAuthConfig());
  },

  createAlumniConnection(payload) {
    return client.post(alumniConnectionsRoute, payload, buildAuthConfig());
  },

  updateAlumniConnection(connectionId, payload) {
    return client.put(
      `${alumniConnectionsRoute}${connectionId}/`,
      payload,
      buildAuthConfig(),
    );
  },

  getAlumniSessions() {
    return client.get(alumniSessionsRoute, buildAuthConfig());
  },

  createAlumniSession(payload) {
    return client.post(alumniSessionsRoute, payload, buildAuthConfig());
  },

  updateAlumniSession(sessionId, payload) {
    return client.put(
      `${alumniSessionsRoute}${sessionId}/`,
      payload,
      buildAuthConfig(),
    );
  },

  getAnnouncements() {
    return client.get(placementAnnouncementsRoute, buildAuthConfig());
  },

  createAnnouncement(payload) {
    return client.post(placementAnnouncementsRoute, payload, buildAuthConfig());
  },

  deleteAnnouncement(announcementId) {
    return client.delete(
      `${placementAnnouncementsRoute}${announcementId}/`,
      buildAuthConfig(),
    );
  },

  getOffCampusPlacements() {
    return client.get(offCampusPlacementsRoute, buildAuthConfig());
  },

  createOffCampusPlacement(payload) {
    return client.post(offCampusPlacementsRoute, payload, buildAuthConfig());
  },

  deleteOffCampusPlacement(placementId) {
    return client.delete(
      `${offCampusPlacementsRoute}${placementId}/`,
      buildAuthConfig(),
    );
  },

  getCpiBatches() {
    return client.get(cpiBatchesRoute, buildAuthConfig());
  },

  getCpiStudents(batchId) {
    return client.get(
      cpiStudentsRoute,
      buildAuthConfig({ params: { batch_id: batchId } }),
    );
  },

  exportCpiStudents(batchId) {
    return client.get(
      cpiStudentsRoute,
      buildAuthConfig({
        params: { batch_id: batchId, export: "excel" },
        responseType: "blob",
      }),
    );
  },

  getBranches() {
    return client.get(placementBranchesRoute, buildAuthConfig());
  },

  listCalendarEvents() {
    return client.get(calendarEventsCrudRoute, buildAuthConfig());
  },

  createCalendarEvent(payload) {
    return client.post(calendarEventsCrudRoute, payload, buildAuthConfig());
  },

  updateCalendarEvent(eventId, payload) {
    return client.patch(
      `${calendarEventsCrudRoute}${eventId}/`,
      payload,
      buildAuthConfig(),
    );
  },

  deleteCalendarEvent(eventId) {
    return client.delete(
      `${calendarEventsCrudRoute}${eventId}/`,
      buildAuthConfig(),
    );
  },
};
