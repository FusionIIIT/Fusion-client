import { describe, it, expect, beforeEach } from "vitest";

import {
  getAuthToken,
  getCsrfToken,
  buildAuthHeaders,
  buildAuthConfig,
  getJobIdFromSearch,
} from "./helpers";

describe("placement helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getAuthToken reads authToken from localStorage", () => {
    expect(getAuthToken()).toBeNull();
    localStorage.setItem("authToken", "abc");
    expect(getAuthToken()).toBe("abc");
  });

  it("buildAuthHeaders adds the Token header when authenticated", () => {
    localStorage.setItem("authToken", "tok123");
    expect(buildAuthHeaders()).toEqual({ Authorization: "Token tok123" });
    expect(buildAuthHeaders({ "X-Custom": "z" })).toEqual({
      Authorization: "Token tok123",
      "X-Custom": "z",
    });
  });

  it("buildAuthHeaders omits Authorization when there is no token", () => {
    expect(buildAuthHeaders()).toEqual({});
    expect(buildAuthHeaders({ "X-Custom": "z" })).toEqual({ "X-Custom": "z" });
  });

  it("buildAuthConfig merges auth headers without dropping other config", () => {
    localStorage.setItem("authToken", "t");
    const config = buildAuthConfig({ params: { a: 1 } });
    expect(config.params).toEqual({ a: 1 });
    expect(config.headers).toEqual({ Authorization: "Token t" });
  });

  it("getCsrfToken reads the named cookie", () => {
    document.cookie = "csrftoken=xyz";
    expect(getCsrfToken()).toBe("xyz");
    expect(getCsrfToken("does-not-exist")).toBe("");
  });

  it("getJobIdFromSearch extracts jobId from a query string", () => {
    expect(getJobIdFromSearch("?jobId=42")).toBe("42");
    expect(getJobIdFromSearch("?other=1")).toBeNull();
  });
});
