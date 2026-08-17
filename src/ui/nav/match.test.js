import { describe, expect, it } from "vitest";

import {
  findActiveGroupCode,
  findActiveLink,
  findActiveModuleLabel,
} from "./match";

const GROUPS = [
  {
    section: "Overview",
    items: [{ code: "home", label: "Dashboard", to: "/dashboard" }],
  },
  {
    section: "Academics",
    items: [
      {
        code: "Academics:Course Changes",
        label: "Course Changes",
        links: [
          { code: "sw", label: "Swayam", to: "/academics/swayam" },
          {
            code: "swr",
            label: "Swayam Replace",
            to: "/academics/swayam-replace",
          },
        ],
      },
    ],
  },
  {
    section: "Modules",
    items: [{ code: "db", label: "Database", to: "/database/view" }],
  },
];

describe("findActiveLink", () => {
  it("prefers the longest match over a shared prefix", () => {
    expect(findActiveLink(GROUPS, "/academics/swayam-replace").to).toBe(
      "/academics/swayam-replace",
    );
    expect(findActiveLink(GROUPS, "/academics/swayam").to).toBe(
      "/academics/swayam",
    );
  });

  it("matches a nested detail path to its parent page", () => {
    expect(findActiveLink(GROUPS, "/database/view/42").to).toBe(
      "/database/view",
    );
  });

  it("returns null for a path outside the tree", () => {
    expect(findActiveLink(GROUPS, "/nowhere")).toBeNull();
  });
});

describe("findActiveGroupCode", () => {
  it("names the group that owns the active page", () => {
    expect(findActiveGroupCode(GROUPS, "/academics/swayam")).toBe(
      "Academics:Course Changes",
    );
  });

  it("returns null for a standalone link", () => {
    expect(findActiveGroupCode(GROUPS, "/dashboard")).toBeNull();
  });
});

describe("findActiveModuleLabel", () => {
  it("uses the section for a grouped page", () => {
    expect(findActiveModuleLabel(GROUPS, "/academics/swayam")).toBe(
      "Academics",
    );
  });

  it("uses the link's own name for a standalone page", () => {
    expect(findActiveModuleLabel(GROUPS, "/dashboard")).toBe("Dashboard");
    expect(findActiveModuleLabel(GROUPS, "/database/view")).toBe("Database");
  });
});
