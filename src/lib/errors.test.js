import { describe, expect, it } from "vitest";

import { errorMessage, errorStatus } from "./errors";

const NOT_STRINGS = [
  new Error("No token found"),
  { response: { status: 500 } },
  { isAxiosError: true, message: "Network Error" },
  null,
  undefined,
  0,
  {},
  [],
];

describe("errorMessage", () => {
  it.each(NOT_STRINGS.map((e) => [JSON.stringify(e) ?? String(e), e]))(
    "returns a renderable string for %s",
    (_name, input) => {
      const out = errorMessage(input);
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    },
  );

  it("passes a plain string through", () => {
    expect(errorMessage("Registration is closed.")).toBe(
      "Registration is closed.",
    );
  });

  it("prefers the server's message over the generic one", () => {
    expect(
      errorMessage({ response: { data: { detail: "Not allowed." } } }),
    ).toBe("Not allowed.");
  });

  it("joins DRF field errors", () => {
    expect(
      errorMessage({
        response: { data: { sem_no: ["This field is required."] } },
      }),
    ).toBe("sem_no: This field is required.");
  });

  it("falls back to the Error's own message", () => {
    expect(errorMessage(new Error("No token found"))).toBe("No token found");
  });

  it("reads the status when there is one", () => {
    expect(errorStatus({ response: { status: 403 } })).toBe(403);
    expect(errorStatus(new Error("boom"))).toBeUndefined();
  });
});
