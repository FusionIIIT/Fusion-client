import { describe, expect, it } from "vitest";

import { isLockedStatus, pagesForRole } from "./roles";

const PAGES = [
  { key: "courses", roles: ["student"], keepWhenLocked: true },
  { key: "prereg", roles: ["student"] },
  {
    key: "alumni",
    roles: ["student"],
    keepWhenLocked: true,
    when: (f) => isLockedStatus(f.studentStatus),
  },
  { key: "admin", roles: ["acadadmin"] },
];

const keys = (pages) => pages.map((p) => p.key);

describe("isLockedStatus", () => {
  it("locks alumni, withdrawn, archived and left, ignoring case and spaces", () => {
    ["ALUMNI", " alumni ", "Withdrawn", "ARCHIVED", "LEFT"].forEach((s) =>
      expect(isLockedStatus(s)).toBe(true),
    );
    ["PRESENT", "NEW", "", null, undefined].forEach((s) =>
      expect(isLockedStatus(s)).toBe(false),
    );
  });
});

describe("pagesForRole", () => {
  it("keeps only the kept pages for an alumnus", () => {
    expect(
      keys(pagesForRole(PAGES, "student", { studentStatus: "ALUMNI" })),
    ).toEqual(["courses", "alumni"]);
  });

  it("is unchanged for a present student", () => {
    expect(
      keys(pagesForRole(PAGES, "student", { studentStatus: "PRESENT" })),
    ).toEqual(["courses", "prereg"]);
    expect(keys(pagesForRole(PAGES, "student"))).toEqual(["courses", "prereg"]);
  });

  it("never narrows a staff role", () => {
    expect(
      keys(pagesForRole(PAGES, "acadadmin", { studentStatus: "ALUMNI" })),
    ).toEqual(["admin"]);
  });
});
