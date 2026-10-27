import { describe, expect, it } from "vitest";
import { buildAdminSemesterOptions, summerNumber } from "./semester";

describe("summerNumber", () => {
  it("maps an even semester to its summer term", () => {
    expect(summerNumber(2)).toBe(1);
    expect(summerNumber(4)).toBe(2);
    expect(summerNumber(8)).toBe(4);
    expect(summerNumber(16)).toBe(8);
  });
});

describe("buildAdminSemesterOptions", () => {
  it("runs to semester 16 with 8 summer terms by default", () => {
    const options = buildAdminSemesterOptions();
    const semesters = options.filter(
      (o) => JSON.parse(o.value).type !== "Summer Semester",
    );
    const summers = options.filter(
      (o) => JSON.parse(o.value).type === "Summer Semester",
    );
    expect(semesters).toHaveLength(16);
    expect(summers).toHaveLength(8);
    expect(options[options.length - 1]).toEqual({
      value: JSON.stringify({ no: 16, type: "Summer Semester" }),
      label: "Summer Term 8",
    });
  });

  it("keeps a summer row immediately after its even semester", () => {
    const options = buildAdminSemesterOptions(4);
    expect(options.map((o) => o.label)).toEqual([
      "Semester 1 (Odd)",
      "Semester 2 (Even)",
      "Summer Term 1",
      "Semester 3 (Odd)",
      "Semester 4 (Even)",
      "Summer Term 2",
    ]);
  });
});
