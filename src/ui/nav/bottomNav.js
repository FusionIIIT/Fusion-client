import { FACULTY_ROLES, STUDENT_ROLES, matchesRole } from "./roles";
import { flattenNavLinks } from "./match";

const CANDIDATES = [
  {
    roles: STUDENT_ROLES,
    items: [
      {
        code: "bn-home",
        label: "Home",
        icon: "House",
        to: "/dashboard",
      },
      {
        code: "bn-courses",
        label: "Courses",
        icon: "Book",
        to: "/academics/registered-courses",
      },
      {
        code: "bn-result",
        label: "Results",
        icon: "Scroll",
        to: "/examination/result",
      },
    ],
  },
  {
    roles: FACULTY_ROLES,
    items: [
      {
        code: "bn-home",
        label: "Home",
        icon: "House",
        to: "/dashboard",
      },
      {
        code: "bn-roll",
        label: "Roll List",
        icon: "ListNumbers",
        to: "/academics/roll-list",
      },
      {
        code: "bn-grades",
        label: "Grades",
        icon: "Stamp",
        to: "/examination/submit-grades-prof",
      },
    ],
  },
];

export function buildBottomNav({ role, navGroups = [] }) {
  const match = CANDIDATES.find((c) => matchesRole(role, c.roles));
  if (!match) return [];

  const reachable = new Set(flattenNavLinks(navGroups).map((l) => l.to));
  const items = match.items.filter((item) => reachable.has(item.to));

  return items.length > 1 ? items : [];
}
