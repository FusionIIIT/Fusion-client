import { describe, expect, it } from "vitest";

import { buildBottomNav } from "./bottomNav";
import { buildNavGroups } from "./navigation";
import { ICONS } from "../icons";

const ALL = {
  course_registration: true,
  program_and_curriculum: true,
  examinations: true,
  thesis_research: true,
};

const navFor = (role, programmeType = null, accessibleModules = ALL) =>
  buildNavGroups({ role, accessibleModules, programmeType });

describe("buildBottomNav", () => {
  it("gives a student dashboard, courses and results", () => {
    const items = buildBottomNav({
      role: "student",
      navGroups: navFor("student", "UG"),
    });
    expect(items.map((i) => i.to)).toEqual([
      "/dashboard",
      "/academics/registered-courses",
      "/examination/result",
    ]);
  });

  it("gives faculty dashboard, roll list and grades", () => {
    const items = buildBottomNav({
      role: "Professor",
      navGroups: navFor("Professor"),
    });
    expect(items.map((i) => i.to)).toEqual([
      "/dashboard",
      "/academics/roll-list",
      "/examination/submit-grades-prof",
    ]);
  });

  it("never exceeds three entries, leaving the fourth slot for More", () => {
    [
      "student",
      "Professor",
      "Assistant Professor",
      "Associate Professor",
    ].forEach((role) => {
      const items = buildBottomNav({
        role,
        navGroups: navFor(role, "UG"),
      });
      expect(items.length).toBeLessThanOrEqual(3);
    });
  });

  it("omits an entry the role cannot reach", () => {
    const noExam = { course_registration: true };
    const items = buildBottomNav({
      role: "student",
      navGroups: navFor("student", "UG", noExam),
    });
    expect(items.map((i) => i.to)).toEqual([
      "/dashboard",
      "/academics/registered-courses",
    ]);
  });

  it("returns nothing when only the dashboard would remain", () => {
    const items = buildBottomNav({
      role: "student",
      navGroups: navFor("student", "UG", {}),
    });
    expect(items).toEqual([]);
  });

  it("gives admin and other roles no bar", () => {
    [
      "acadadmin",
      "studentacadadmin",
      "Dean Academic",
      "HOD (CSE)",
      "Director",
    ].forEach((role) => {
      expect(buildBottomNav({ role, navGroups: navFor(role) })).toEqual([]);
    });
  });

  it("uses icons that resolve", () => {
    ["student", "Professor"].forEach((role) => {
      buildBottomNav({ role, navGroups: navFor(role, "UG") }).forEach((item) =>
        expect(ICONS).toHaveProperty(item.icon),
      );
    });
  });
});
