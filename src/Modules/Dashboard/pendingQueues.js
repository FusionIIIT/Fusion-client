import {
  FAC_PENDING_URL,
  adminPendingCountsRoute,
  deanThesisExaminerPanelDashboardRoute,
  supervisorDashboardRoute,
} from "../../routes/academicRoutes";

const listLength = (rows) => (Array.isArray(rows) ? rows.length : 0);

const adminCount = (key) => (data) => Number(data?.counts?.[key]) || 0;

export const PENDING_QUEUES = [
  {
    key: "swayam",
    label: "Swayam requests",
    to: "/academics/swayam",
    url: adminPendingCountsRoute,
    count: adminCount("swayam"),
  },
  {
    key: "add",
    label: "Add requests",
    to: "/academics/add-bl-courses",
    url: adminPendingCountsRoute,
    count: adminCount("add"),
  },
  {
    key: "drop",
    label: "Drop requests",
    to: "/academics/drop-courses",
    url: adminPendingCountsRoute,
    count: adminCount("drop"),
  },
  {
    key: "replacement",
    label: "Replacement requests",
    to: "/academics/replacement-allocation",
    url: adminPendingCountsRoute,
    count: adminCount("replacement"),
  },
  {
    key: "phdCourses",
    label: "PG / Ph.D. course requests",
    to: "/academics/thesis-course-requests",
    url: adminPendingCountsRoute,
    count: adminCount("phdCourses"),
  },
  {
    key: "thesisEnrolments",
    label: "Thesis enrolments",
    to: "/academics/thesis-course-requests",
    url: adminPendingCountsRoute,
    count: adminCount("thesisEnrolments"),
  },
  {
    key: "progressSeminars",
    label: "Progress seminar enrolments",
    to: "/academics/thesis-course-requests",
    url: adminPendingCountsRoute,
    count: adminCount("progressSeminars"),
  },
  {
    key: "teachingCredits",
    label: "Teaching credit enrolments",
    to: "/academics/thesis-course-requests",
    url: adminPendingCountsRoute,
    count: adminCount("teachingCredits"),
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

// Queues that read the same endpoint share one request.
export function requestsFor(queues) {
  const byUrl = new Map();
  queues.forEach((queue) => {
    const existing = byUrl.get(queue.url);
    if (existing) existing.push(queue);
    else byUrl.set(queue.url, [queue]);
  });
  return [...byUrl.entries()].map(([url, group]) => ({ url, queues: group }));
}

export function countsByPath(queues, counts) {
  const totals = {};
  queues.forEach((queue) => {
    const value = Number(counts?.[queue.key]) || 0;
    if (value) totals[queue.to] = (totals[queue.to] ?? 0) + value;
  });
  return totals;
}
