import { describe, expect, it } from "vitest";

import { matchesQuery } from "./search";

describe("matchesQuery", () => {
  it("keeps every row when the query is empty", () => {
    expect(matchesQuery("", ["B.Tech CSE"])).toBe(true);
    expect(matchesQuery("   ", ["B.Tech CSE"])).toBe(true);
    expect(matchesQuery(null, ["B.Tech CSE"])).toBe(true);
  });

  it("matches any of the given fields", () => {
    const fields = ["B.Tech CSE", "Computer Science and Engineering"];
    expect(matchesQuery("b.tech", fields)).toBe(true);
    expect(matchesQuery("science", fields)).toBe(true);
    expect(matchesQuery("design", fields)).toBe(false);
  });

  it("ignores case", () => {
    expect(matchesQuery("CSE", ["b.tech cse"])).toBe(true);
  });

  it("requires every token to match, across different fields", () => {
    const fields = ["B.Tech CSE", "Computer Science and Engineering"];
    expect(matchesQuery("btech science", fields)).toBe(false);
    expect(matchesQuery("cse computer", fields)).toBe(true);
  });

  it("matches non-string values", () => {
    expect(matchesQuery("4", ["CS3001", 4])).toBe(true);
    expect(matchesQuery("2016", ["CS3001", "v1.0", 2016])).toBe(true);
  });

  it("skips null and undefined fields", () => {
    expect(matchesQuery("cse", ["B.Tech CSE", null, undefined])).toBe(true);
    expect(matchesQuery("cse", [null, undefined])).toBe(false);
  });
});
