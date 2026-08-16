import { describe, expect, it } from "vitest";

import { formatDate, formatTime, formatWhen } from "./datetime";

describe("formatDate", () => {
  it("reads a Date", () => {
    expect(formatDate(new Date(2026, 7, 3))).toBe("Aug 3, 2026");
  });

  it("reads an ISO day without shifting it a day earlier", () => {
    expect(formatDate("2026-08-03")).toBe("Aug 3, 2026");
  });

  it.each([[null], [undefined], [""], ["not-a-date"]])(
    "returns empty for %s",
    (value) => {
      expect(formatDate(value)).toBe("");
    },
  );
});

describe("formatTime", () => {
  it.each([
    ["00:00:00", "12:00 AM"],
    ["09:05", "9:05 AM"],
    ["12:00", "12:00 PM"],
    ["17:00:00", "5:00 PM"],
    ["23:59", "11:59 PM"],
  ])("renders %s as %s", (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });

  it.each([[null], [""], ["nonsense"]])("returns empty for %s", (value) => {
    expect(formatTime(value)).toBe("");
  });
});

describe("formatWhen", () => {
  it("appends the time when one is set", () => {
    expect(formatWhen("2026-08-08", "17:00:00")).toBe("Aug 8, 2026, 5:00 PM");
  });

  it("shows the date alone for a whole-day event", () => {
    expect(formatWhen("2026-08-08", null)).toBe("Aug 8, 2026");
  });

  it("falls back to an em dash with no date", () => {
    expect(formatWhen(null, "17:00")).toBe("—");
  });
});
