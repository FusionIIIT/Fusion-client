import { describe, expect, it } from "vitest";

import { PENDING_QUEUES, queuesFor } from "./pendingQueues";

const queue = (key) => PENDING_QUEUES.find((q) => q.key === key);

describe("queuesFor", () => {
  it("offers only queues whose page the role can reach", () => {
    const keys = queuesFor([
      "/academics/swayam",
      "/academics/add-bl-courses",
      "/dashboard",
    ]).map((q) => q.key);
    expect(keys).toEqual(["swayam", "add"]);
  });

  it("offers nothing to a role with no pages", () => {
    expect(queuesFor([])).toEqual([]);
  });

  it("gives every queue a label and a destination", () => {
    PENDING_QUEUES.forEach((q) => {
      expect(q.label).toBeTruthy();
      expect(q.to.startsWith("/")).toBe(true);
      expect(typeof q.count).toBe("function");
    });
  });
});

describe("counting a queue", () => {
  it("takes the server's own pending count for swayam", () => {
    expect(
      queue("swayam").count({ counts: { pending: 12, approved: 3 } }),
    ).toBe(12);
    expect(queue("swayam").count({})).toBe(0);
  });

  it("counts only Pending rows for add, drop and replacement", () => {
    const rows = [
      { status: "Pending" },
      { status: "Approved" },
      { status: "Pending" },
      { status: "Rejected" },
    ];
    ["add", "drop", "replacement"].forEach((key) => {
      expect(queue(key).count(rows)).toBe(2);
    });
  });

  it("matches the status whatever its casing", () => {
    expect(
      queue("add").count([{ status: "pending" }, { status: "PENDING" }]),
    ).toBe(2);
  });

  it("reads the wrapper key each endpoint uses", () => {
    expect(queue("phdCourses").count({ requests: [1, 2, 3] })).toBe(3);
    expect(queue("thesisEnrolments").count({ registrations: [1, 2] })).toBe(2);
    expect(
      queue("thesisTopics").count({ pending: [1], forwarded: [1, 2] }),
    ).toBe(1);
    expect(queue("stipends").count({ stipends: [1, 2, 3, 4] })).toBe(4);
  });

  it("counts only panels waiting on the dean", () => {
    expect(
      queue("examinerPanels").count({
        panels: [
          { status: "dean_pending" },
          { status: "hod_pending" },
          { status: "dean_pending" },
          { status: "completed" },
        ],
      }),
    ).toBe(2);
  });

  it("returns zero rather than throwing on an unexpected payload", () => {
    PENDING_QUEUES.forEach((q) => {
      expect(q.count(undefined)).toBe(0);
      expect(q.count(null)).toBe(0);
      expect(q.count({})).toBe(0);
      expect(q.count("nonsense")).toBe(0);
    });
  });
});
