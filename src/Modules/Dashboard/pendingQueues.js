import {
  FAC_PENDING_URL,
  adminListAddRequestsRoute,
  adminListDropRequestsRoute,
  adminListRequestsRoute,
  adminProgressSeminarEnrollmentListRoute,
  adminSwayamListRequestsRoute,
  adminTeachingCreditEnrollmentListRoute,
  adminThesisEnrollmentListRoute,
  deanThesisExaminerPanelDashboardRoute,
  phdAdminListCourseRequestsRoute,
  supervisorDashboardRoute,
} from "../../routes/academicRoutes";

const pendingIn = (rows) =>
  (Array.isArray(rows) ? rows : []).filter(
    (row) => String(row?.status ?? "").toLowerCase() === "pending",
  ).length;

const listLength = (rows) => (Array.isArray(rows) ? rows.length : 0);

export const PENDING_QUEUES = [
  {
    key: "swayam",
    label: "Swayam requests",
    to: "/academics/swayam",
    url: adminSwayamListRequestsRoute,
    params: { status: "Pending" },
    count: (data) => Number(data?.counts?.pending) || 0,
  },
  {
    key: "add",
    label: "Add requests",
    to: "/academics/add-bl-courses",
    url: adminListAddRequestsRoute,
    params: { status: "Pending" },
    count: pendingIn,
  },
  {
    key: "drop",
    label: "Drop requests",
    to: "/academics/drop-courses",
    url: adminListDropRequestsRoute,
    params: { status: "Pending" },
    count: pendingIn,
  },
  {
    key: "replacement",
    label: "Replacement requests",
    to: "/academics/replacement-allocation",
    url: adminListRequestsRoute,
    params: { status: "Pending" },
    count: pendingIn,
  },
  {
    key: "phdCourses",
    label: "PhD course requests",
    to: "/academics/thesis-course-requests",
    url: phdAdminListCourseRequestsRoute,
    params: { status: "pending" },
    count: (data) => listLength(data?.requests),
  },
  {
    key: "thesisEnrolments",
    label: "Thesis enrolments",
    to: "/academics/thesis-course-requests",
    url: adminThesisEnrollmentListRoute,
    params: { status: "pending" },
    count: (data) => listLength(data?.registrations),
  },
  {
    key: "progressSeminars",
    label: "Progress seminar enrolments",
    to: "/academics/thesis-course-requests",
    url: adminProgressSeminarEnrollmentListRoute,
    params: { status: "pending" },
    count: (data) => listLength(data?.registrations),
  },
  {
    key: "teachingCredits",
    label: "Teaching credit enrolments",
    to: "/academics/thesis-course-requests",
    url: adminTeachingCreditEnrollmentListRoute,
    params: { status: "pending" },
    count: (data) => listLength(data?.registrations),
  },
  {
    key: "thesisTopics",
    label: "Thesis topics to review",
    to: "/thesis-research/thesis-review",
    url: supervisorDashboardRoute,
    count: (data) => listLength(data?.pending),
  },
  {
    key: "stipends",
    label: "TA stipend approvals",
    to: "/academics/ta-management",
    url: FAC_PENDING_URL,
    count: (data) => listLength(data?.stipends),
  },
  {
    key: "examinerPanels",
    label: "Examiner panels to rank",
    to: "/thesis-research/pg-examiner-panel",
    url: deanThesisExaminerPanelDashboardRoute,
    count: (data) =>
      (Array.isArray(data?.panels) ? data.panels : []).filter(
        (panel) => panel?.status === "dean_pending",
      ).length,
  },
];

export function queuesFor(reachablePaths) {
  const reachable = new Set(reachablePaths);
  return PENDING_QUEUES.filter((queue) => reachable.has(queue.to));
}
