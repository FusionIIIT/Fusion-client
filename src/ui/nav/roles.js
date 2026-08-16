export const ADMIN_ROLES = ["acadadmin", "studentacadadmin"];
export const FACULTY_ROLES = [
  "faculty",
  "Professor",
  "Associate Professor",
  "Assistant Professor",
];
export const STUDENT_ROLES = ["student"];
export const DEAN_ROLES = ["Dean Academic"];
export const DIRECTOR_ROLES = ["Director"];
export const HOD_ROLES = ["HOD*"];

export function matchesRole(role, allowed) {
  if (!role || !allowed?.length) return false;
  return allowed.some((a) =>
    a.endsWith("*") ? role.startsWith(a.slice(0, -1)) : a === role,
  );
}

export function pagesForRole(pages, role, flags = {}) {
  return pages.filter((p) => {
    if (!matchesRole(role, p.roles)) return false;
    return p.when ? p.when(flags) : true;
  });
}
