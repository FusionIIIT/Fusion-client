import { describe, expect, it } from "vitest";

import { PENDING_QUEUES, queuesFor, requestsFor } from "./pendingQueues";

const queue = (key) => PENDING_QUEUES.find((q) => q.key === key);

const ADMIN_COUNTS = {
  counts: {
    swayam: 12,
    add: 5,
    drop: 2,
    replacement: 1,
    phdCourses: 330,
    thesisEnrolments: 3,
    progressSeminars: 0,
    teachingCredits: 0,
  },
};

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

describe("requestsFor", () => {
  it("collapses queues sharing an endpoint into one request", () => {
    const admin = queuesFor([
      "/academics/swayam",
      "/academics/drop-courses",
      "/academics/thesis-course-requests",
    ]);
    const requests = requestsFor(admin);
    expect(requests).toHaveLength(1);
    expect(requests[0].queues.map((q) => q.key)).toEqual(
      admin.map((q) => q.key),
    );
  });

  it("keeps queues on different endpoints apart", () => {
    const mixed = queuesFor(["/academics/swayam", "/academics/ta-management"]);
    expect(requestsFor(mixed)).toHaveLength(2);
  });

  it("asks for nothing when no queue applies", () => {
    expect(requestsFor([])).toEqual([]);
  });
});

describe("counting a queue", () => {
  it("reads each admin queue from the shared counts payload", () => {
    expect(queue("swayam").count(ADMIN_COUNTS)).toBe(12);
    expect(queue("drop").count(ADMIN_COUNTS)).toBe(2);
    expect(queue("phdCourses").count(ADMIN_COUNTS)).toBe(330);
    expect(queue("teachingCredits").count(ADMIN_COUNTS)).toBe(0);
  });

  it("reads the wrapper key the faculty and dean endpoints use", () => {
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
