import { describe, expect, it } from "vitest";

import { bulkFailureNote, failureMessage } from "./statusChangeMessages";

const REFUSED =
  "23BEC020 has course registrations or grades. Use Withdraw on the Student Status page instead; nothing was changed.";

describe("failureMessage", () => {
  it("shows what the server said", () => {
    expect(
      failureMessage(
        { success: false, error: { message: REFUSED } },
        "Failed.",
      ),
    ).toBe(REFUSED);
  });

  it("falls back when the server said nothing useful", () => {
    expect(failureMessage({ success: false, error: {} }, "Failed.")).toBe(
      "Failed.",
    );
    expect(failureMessage({ success: false, error: "Network down" }, "x")).toBe(
      "Network down",
    );
  });
});

describe("bulkFailureNote", () => {
  it("names each distinct reason once", () => {
    expect(bulkFailureNote([REFUSED, REFUSED, "Student not found"])).toBe(
      ` Reasons: ${REFUSED} Student not found`,
    );
  });

  it("says nothing when there is no reason", () => {
    expect(bulkFailureNote([null, undefined])).toBe("");
  });
});
