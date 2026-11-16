import { describe, expect, it } from "vitest";
import {
  MIN_ACADEMIC_YEAR,
  academicYearLabel,
  allocationTermLabel,
  allocationYear,
  buildSessionLabels,
  buildSessionOptions,
  buildYearOptions,
} from "./academicYear";

describe("academicYearLabel", () => {
  it("pairs a year with the last two digits of the next one", () => {
    expect(academicYearLabel(2018)).toBe("2018-19");
    expect(academicYearLabel(2026)).toBe("2026-27");
    expect(academicYearLabel(1999)).toBe("1999-00");
  });
});

describe("buildSessionOptions", () => {
  it("runs down to 2018 by default, newest first", () => {
    const options = buildSessionOptions(2020);
    expect(options).toEqual([
      { value: "2020-21", label: "2020-21" },
      { value: "2019-20", label: "2019-20" },
      { value: "2018-19", label: "2018-19" },
    ]);
  });

  it("honours a lower floor when one is given", () => {
    expect(buildSessionOptions(2020, 2019)).toHaveLength(2);
  });
});

describe("buildSessionLabels", () => {
  it("returns bare strings in the same range", () => {
    expect(buildSessionLabels(2019)).toEqual(["2019-20", "2018-19"]);
  });
});

describe("buildYearOptions", () => {
  it("returns plain calendar years down to MIN_ACADEMIC_YEAR", () => {
    const options = buildYearOptions(MIN_ACADEMIC_YEAR + 1);
    expect(options).toEqual([
      {
        value: String(MIN_ACADEMIC_YEAR + 1),
        label: String(MIN_ACADEMIC_YEAR + 1),
      },
      { value: String(MIN_ACADEMIC_YEAR), label: String(MIN_ACADEMIC_YEAR) },
    ]);
  });
});

describe("allocationYear", () => {
  it("puts an Odd semester in the year it starts", () => {
    expect(allocationYear(2024, 1)).toBe(2024);
    expect(allocationYear("2024", "5")).toBe(2026);
  });

  it("puts an Even semester in the next calendar year", () => {
    expect(allocationYear(2024, 2)).toBe(2025);
    expect(allocationYear("2024", "6")).toBe(2027);
  });
});

describe("allocationTermLabel", () => {
  it("names the session an Even semester belongs to", () => {
    expect(allocationTermLabel("6", "2027")).toBe(
      "Even Semester of 2026-27 (January–May 2027)",
    );
  });

  it("names the session an Odd semester belongs to", () => {
    expect(allocationTermLabel(5, 2026)).toBe(
      "Odd Semester of 2026-27 (from August 2026)",
    );
  });
});
