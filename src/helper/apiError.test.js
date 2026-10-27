import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./apiError";

const axiosError = (status, data) => ({
  message: `Request failed with status code ${status}`,
  request: {},
  response: { status, data },
});

describe("getApiErrorMessage", () => {
  it("uses the message the Fusion API sends instead of the axios message", () => {
    const err = axiosError(400, {
      success: false,
      message: "Missing required fields: programme, discipline",
    });
    expect(getApiErrorMessage(err)).toBe(
      "Missing required fields: programme, discipline",
    );
  });

  it("reads an error key", () => {
    expect(
      getApiErrorMessage(axiosError(400, { error: "Batch already exists" })),
    ).toBe("Batch already exists");
  });

  it("reads a DRF detail key", () => {
    expect(
      getApiErrorMessage(axiosError(400, { detail: "Invalid page." })),
    ).toBe("Invalid page.");
  });

  it("flattens DRF field errors", () => {
    const err = axiosError(400, {
      discipline: ["This field is required."],
      total_seats: ["Must be a positive integer."],
    });
    expect(getApiErrorMessage(err)).toBe(
      "discipline: This field is required.; total_seats: Must be a positive integer.",
    );
  });

  it("reads non_field_errors", () => {
    const err = axiosError(400, {
      non_field_errors: ["Batch with this year already exists."],
    });
    expect(getApiErrorMessage(err)).toBe(
      "Batch with this year already exists.",
    );
  });

  it("accepts a plain string body", () => {
    expect(
      getApiErrorMessage(axiosError(400, "Curriculum is not working")),
    ).toBe("Curriculum is not working");
  });

  it("ignores an HTML error page", () => {
    const err = axiosError(500, "<!DOCTYPE html><html>Server Error</html>");
    expect(getApiErrorMessage(err)).toBe(
      "The server ran into a problem. Please try again shortly.",
    );
  });

  it("explains the status when the body says nothing", () => {
    expect(getApiErrorMessage(axiosError(401, {}))).toBe(
      "Your session has expired. Please sign in again.",
    );
    expect(getApiErrorMessage(axiosError(403, {}))).toBe(
      "You do not have permission to do this.",
    );
    expect(getApiErrorMessage(axiosError(404, {}))).toBe(
      "The requested record was not found.",
    );
  });

  it("reports a request that never reached the server", () => {
    expect(getApiErrorMessage({ message: "Network Error", request: {} })).toBe(
      "Could not reach the server. Check your connection and try again.",
    );
  });

  it("passes through a locally thrown error", () => {
    expect(getApiErrorMessage(new Error("Batch name is required"))).toBe(
      "Batch name is required",
    );
  });

  it("falls back when there is nothing to read", () => {
    expect(
      getApiErrorMessage(axiosError(400, {}), "Unable to create batch."),
    ).toBe("Unable to create batch.");
    expect(getApiErrorMessage(null, "Unable to create batch.")).toBe(
      "Unable to create batch.",
    );
  });
});
