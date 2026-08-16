import { describe, expect, it } from "vitest";

import {
  computeCreditSummary,
  fmtCredits,
  remainingCreditRequirement,
} from "./credits";

const course = (code, credits, grade, remark = "Regular") => ({
  code,
  name: code,
  credits,
  grade,
  remark,
});

describe("computeCreditSummary", () => {
  it("splits a semester into regular, backlog/improvement and swayam", () => {
    const { rows, totals } = computeCreditSummary([
      {
        label: "Semester 5",
        courses: [
          course("CS3010", 4, "A"),
          course("CS3020", 3, "B", "Backlog"),
          course("CS3030", 2, "A", "Improvement"),
          course("SW1001", 2, "A"),
        ],
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      label: "Semester 5",
      earned: 11,
      regular: 4,
      backlogImp: 5,
      swayam: 2,
    });
    expect(totals).toEqual({
      earned: 11,
      regular: 4,
      backlogImp: 5,
      swayam: 2,
    });
  });

  it("earns credit for S but not for X or a failing/missing grade", () => {
    const { totals } = computeCreditSummary([
      {
        label: "Semester 1",
        courses: [
          course("A101", 4, "S"),
          course("A102", 4, "X"),
          course("A103", 4, "F"),
          course("A104", 4, "I"),
          course("A105", 4, "AU"),
          course("A106", 4, "CD"),
          course("A107", 4, "—"),
          course("A108", 4, ""),
          course("A109", 4, null),
        ],
      },
    ]);
    expect(totals.earned).toBe(4);
    expect(totals.regular).toBe(4);
  });

  it("ignores registered-but-ungraded semesters", () => {
    const { rows, totals } = computeCreditSummary([
      { label: "Semester 1", courses: [course("A101", 4, "A")] },
      {
        label: "Semester 2 (Registered)",
        is_registered_only: true,
        courses: [course("A201", 4, "—")],
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(totals.earned).toBe(4);
  });

  it("reproduces the Credits Details totals from the grade-validation PDF", () => {
    const semesters = [
      { label: "Semester 1", regular: 20, swayam: 0 },
      { label: "Semester 2", regular: 14, swayam: 0 },
      { label: "Semester 3", regular: 22, swayam: 0 },
      { label: "Semester 4", regular: 23, swayam: 0 },
      { label: "Semester 5", regular: 21, swayam: 2 },
      { label: "Semester 6", regular: 16, swayam: 4 },
    ].map(({ label, regular, swayam }) => ({
      label,
      courses: [
        course(`RG-${label}`, regular, "A"),
        ...(swayam ? [course(`SW-${label}`, swayam, "A")] : []),
      ],
    }));

    const { rows, totals } = computeCreditSummary(semesters);

    expect(rows.map((r) => r.earned)).toEqual([20, 14, 22, 23, 23, 20]);
    expect(totals).toEqual({
      earned: 122,
      regular: 116,
      backlogImp: 0,
      swayam: 6,
    });
  });

  it("shows an improvement in its own semester but credits the degree once", () => {
    const { rows, totals } = computeCreditSummary([
      { label: "Semester 1", courses: [course("IT1001", 3, "C")] },
      {
        label: "Semester 5",
        courses: [
          course("CS3001", 4, "A"),
          course("IT1001", 3, "C", "Improvement"),
        ],
      },
    ]);

    // the semester stands on its own: the retake counts in Semester 5
    expect(rows.map((r) => r.earned)).toEqual([3, 7]);
    expect(rows[1].backlogImp).toBe(3);
    expect(rows[1].regular).toBe(4);

    // Credits Earned counts IT1001 once; the category columns total on their own
    expect(totals.earned).toBe(7);
    expect(totals.regular).toBe(7);
    expect(totals.backlogImp).toBe(3);
  });

  it("lets the semester rows add up to more than the total", () => {
    const { rows, totals } = computeCreditSummary([
      { label: "Semester 1", courses: [course("IT1001", 3, "C")] },
      {
        label: "Semester 5",
        courses: [course("IT1001", 3, "B", "Improvement")],
      },
    ]);

    expect(rows.reduce((a, r) => a + r.earned, 0)).toBe(6);
    expect(totals.earned).toBe(3);
  });

  it("credits a failed-then-passed course once, in the passing semester", () => {
    const { rows, totals } = computeCreditSummary([
      { label: "Semester 2", courses: [course("NS1004", 4, "F")] },
      { label: "Semester 4", courses: [course("NS1004", 4, "C", "Backlog")] },
    ]);

    expect(rows.map((r) => r.earned)).toEqual([0, 4]);
    expect(totals.earned).toBe(4);
    expect(totals.backlogImp).toBe(4);
  });

  it("drops an elective the backend marked superseded by its replacement", () => {
    const { totals } = computeCreditSummary([
      {
        label: "Semester 5",
        courses: [
          { ...course("OE2C09", 3, "B"), superseded: true },
          course("SW01r", 3, "B"),
        ],
      },
    ]);

    expect(totals.earned).toBe(3);
    expect(totals.swayam).toBe(3);
    // the replaced elective was still graded that semester, so its column keeps it
    expect(totals.regular).toBe(3);
  });

  it("totals each category column on its own, so they can exceed Credits Earned", () => {
    const { totals } = computeCreditSummary([
      { label: "Semester 1", courses: [course("A101", 4, "A")] },
      {
        label: "Semester 2",
        courses: [
          course("A101", 4, "A", "Improvement"),
          course("SW1", 2, "A"),
          course("B202", 3, "B", "Backlog"),
        ],
      },
    ]);

    expect(totals.regular).toBe(4);
    expect(totals.backlogImp).toBe(7);
    expect(totals.swayam).toBe(2);
    expect(totals.earned).toBe(9);
    expect(totals.regular + totals.backlogImp + totals.swayam).toBe(13);
  });

  it("handles a student with no grades yet", () => {
    const { rows, totals } = computeCreditSummary([]);
    expect(rows).toEqual([]);
    expect(totals).toEqual({
      earned: 0,
      regular: 0,
      backlogImp: 0,
      swayam: 0,
    });
  });
});

describe("fmtCredits", () => {
  it("keeps whole numbers whole and half-credits to one decimal", () => {
    expect(fmtCredits(20)).toBe("20");
    expect(fmtCredits(1.5)).toBe("1.5");
  });
});

describe("remainingCreditRequirement", () => {
  it("subtracts the credits earned when swayam is within the 6-credit cap", () => {
    expect(remainingCreditRequirement({ earned: 123, swayam: 4 })).toBe(25);
    expect(remainingCreditRequirement({ earned: 116, swayam: 0 })).toBe(32);
    expect(remainingCreditRequirement({ earned: 122, swayam: 6 })).toBe(26);
  });

  it("discounts only the swayam credits above the cap", () => {
    expect(remainingCreditRequirement({ earned: 124, swayam: 8 })).toBe(26);
    expect(remainingCreditRequirement({ earned: 130, swayam: 10 })).toBe(22);
  });

  it("goes negative once the requirement is already exceeded", () => {
    expect(remainingCreditRequirement({ earned: 151, swayam: 5 })).toBe(-3);
  });
});
