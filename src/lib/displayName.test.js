import { describe, expect, it } from "vitest";

import { displayName } from "./displayName";

describe("displayName", () => {
  it("drops the trailing underscore left by an empty last name", () => {
    expect(displayName("VIKRANT KUMAR_")).toBe("VIKRANT KUMAR");
  });

  it("turns an underscore between names into a space", () => {
    expect(displayName("VIKRANT_KUMAR")).toBe("VIKRANT KUMAR");
  });

  it("collapses repeated underscores and spaces", () => {
    expect(displayName("ASHA__VERMA")).toBe("ASHA VERMA");
    expect(displayName("  Dr.  Asha   Verma ")).toBe("Dr. Asha Verma");
  });

  it("leaves a clean name untouched", () => {
    expect(displayName("Dr. Asha Verma")).toBe("Dr. Asha Verma");
  });

  it("falls back when nothing is left", () => {
    expect(displayName("_", "User")).toBe("User");
    expect(displayName("", "User")).toBe("User");
    expect(displayName(null, "User")).toBe("User");
    expect(displayName(undefined, "User")).toBe("User");
  });

  it("returns an empty string with no fallback given", () => {
    expect(displayName("___")).toBe("");
  });
});
