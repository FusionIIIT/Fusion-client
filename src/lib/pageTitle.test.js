import { describe, expect, it } from "vitest";

import { APP_NAME, INSTITUTE, pageTitle } from "./pageTitle";

describe("pageTitle", () => {
  it("leads with the page name, since a tab truncates the end", () => {
    expect(pageTitle("Registered Courses")).toBe(
      `Registered Courses · ${APP_NAME}`,
    );
  });

  it("falls back to the app and institute when there is no page name", () => {
    [undefined, null, "", "   "].forEach((v) =>
      expect(pageTitle(v)).toBe(`${APP_NAME} · ${INSTITUTE}`),
    );
  });

  it("ignores a non-string title rather than printing it", () => {
    expect(pageTitle(42)).toBe(`${APP_NAME} · ${INSTITUTE}`);
  });

  it("trims stray whitespace from a manifest title", () => {
    expect(pageTitle("  Swayam  ")).toBe(`Swayam · ${APP_NAME}`);
  });
});
