import { describe, expect, it } from "vitest";

import { closedMessage } from "./FinalRegistration";

describe("closedMessage", () => {
  it("says a window that has passed is closed, not that it has not started", () => {
    expect(
      closedMessage({
        frd_configured: true,
        frd_from: "2026-05-27",
        frd_to: "1999-08-03",
      }),
    ).toBe("Final Registration closed on Aug 3, 1999.");
  });

  it("names the opening date for a window still ahead", () => {
    expect(
      closedMessage({
        frd_configured: true,
        frd_from: "2999-05-27",
        frd_to: "2999-08-03",
      }),
    ).toBe("Final Registration opens on May 27, 2999.");
  });

  it("distinguishes a missing calendar entry from a closed window", () => {
    expect(closedMessage({ frd_configured: false })).toMatch(
      /not been scheduled/,
    );
  });

  it("falls back when the dates are absent but the entry exists", () => {
    expect(
      closedMessage({ frd_configured: true, frd_from: null, frd_to: null }),
    ).toBe("Final Registration is not open for the next semester.");
  });
});
