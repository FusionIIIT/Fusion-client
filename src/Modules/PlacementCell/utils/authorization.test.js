import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

// eslint-disable-next-line import/first
import { notifications } from "@mantine/notifications";
// eslint-disable-next-line import/first
import {
  PLACEMENT_OFFICER_ROLES,
  PLACEMENT_ADMIN_ROLES,
  isForbiddenError,
  getAuthorizationErrorMessage,
  showAuthorizationError,
  showApiError,
} from "./authorization";

describe("placement authorization utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defines the expected role lists", () => {
    expect(PLACEMENT_OFFICER_ROLES).toEqual(["placement officer"]);
    expect(PLACEMENT_ADMIN_ROLES).toEqual([
      "placement officer",
      "placement chairman",
    ]);
  });

  it("isForbiddenError only matches HTTP 403", () => {
    expect(isForbiddenError({ response: { status: 403 } })).toBe(true);
    expect(isForbiddenError({ response: { status: 400 } })).toBe(false);
    expect(isForbiddenError(undefined)).toBe(false);
    expect(isForbiddenError({})).toBe(false);
  });

  it("getAuthorizationErrorMessage prefers the backend detail, else fallback", () => {
    expect(
      getAuthorizationErrorMessage({
        response: { data: { detail: "Only TPO" } },
      }),
    ).toBe("Only TPO");
    expect(getAuthorizationErrorMessage({})).toMatch(/not authorized/i);
    expect(getAuthorizationErrorMessage({}, "custom fallback")).toBe(
      "custom fallback",
    );
  });

  it("showAuthorizationError shows a red notification with the detail", () => {
    showAuthorizationError({ response: { data: { detail: "nope" } } });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red", message: "nope" }),
    );
  });

  it("showApiError routes 403 to the authorization notification", () => {
    showApiError({
      error: { response: { status: 403, data: { detail: "forbidden" } } },
      fallback: "fb",
    });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Authorization Error",
        message: "forbidden",
      }),
    );
  });

  it("showApiError shows a generic error for non-403 responses", () => {
    showApiError({
      error: { response: { status: 500, data: {} } },
      fallback: "Server error",
      title: "Boom",
    });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Boom", message: "Server error" }),
    );
  });
});
