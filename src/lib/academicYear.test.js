import { describe, expect, it } from "vitest";
import {
  MIN_ACADEMIC_YEAR,
  academicYearLabel,
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
