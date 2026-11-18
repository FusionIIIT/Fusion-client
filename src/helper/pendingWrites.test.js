import { describe, expect, it, vi } from "vitest";

import { pendingWrites, trackPendingWrites } from "./pendingWrites";

// A stand-in browser: an XMLHttpRequest whose requests end when the test says,
// and a fetch whose replies the test settles.
function fakeWindow({ sendThrows = false } = {}) {
  class FakeXHR {
    constructor() {
      this.listeners = [];
    }

    open(method) {
      this.method = method;
    }

    send() {
      this.sent = true;
      if (sendThrows) throw new Error("InvalidStateError");
    }

    addEventListener(type, listener) {
      if (type === "loadend") this.listeners.push(listener);
    }

    end() {
      this.listeners.forEach((listener) => listener());
    }
  }
  const replies = [];
  const fetch = vi.fn(
    () =>
      new Promise((resolve, reject) => {
        replies.push({ resolve, reject });
      }),
  );
  const win = { XMLHttpRequest: FakeXHR, fetch };
  trackPendingWrites(win);
  return { win, replies, fetch };
}

function xhr(win, method) {
  const request = new win.XMLHttpRequest();
  request.open(method, "/api/x");
  request.send();
  return request;
}

const settle = async (promise) => {
  await promise.catch(() => {});
};

describe("pendingWrites", () => {
  it.each(["POST", "put", "PATCH", "DELETE"])(
    "counts an XMLHttpRequest %s (axios) until it ends",
    (method) => {
      const { win } = fakeWindow();
      const request = xhr(win, method);
      expect(pendingWrites()).toBe(1);

      request.end();
      expect(pendingWrites()).toBe(0);
      request.end();
      expect(pendingWrites()).toBe(0);
    },
  );

  it("doesn't count reads", async () => {
    const { win, replies } = fakeWindow();
    const get = xhr(win, "GET");
    const head = xhr(win, "head");
    const read = win.fetch("/");
    const readWithInit = win.fetch("/", { cache: "no-cache" });
    const lowerCaseRead = win.fetch("/", { method: "get" });
    // Still open: counting reads would show here.
    expect(pendingWrites()).toBe(0);
    get.end();
    head.end();
    replies.forEach(({ resolve }) => resolve({ ok: true }));
    await Promise.all([read, readWithInit, lowerCaseRead]);
  });

  it("isn't left counting when send throws", () => {
    const { win } = fakeWindow({ sendThrows: true });
    expect(() => xhr(win, "POST")).toThrow("InvalidStateError");
    expect(pendingWrites()).toBe(0);
  });

  it("counts a fetch POST until it is answered, and hands back the reply", async () => {
    const { win, replies } = fakeWindow();
    const answer = { ok: true };
    const request = win.fetch("/api/x", { method: "post", body: "{}" });
    expect(pendingWrites()).toBe(1);

    replies[0].resolve(answer);
    await expect(request).resolves.toBe(answer);
    expect(pendingWrites()).toBe(0);
  });

  it("counts a fetch POST until it fails, and passes the error on", async () => {
    const { win, replies } = fakeWindow();
    const failure = new TypeError("network");
    const request = win.fetch("/api/x", { method: "post", body: "{}" });
    expect(pendingWrites()).toBe(1);

    replies[0].reject(failure);
    await expect(request).rejects.toBe(failure);
    expect(pendingWrites()).toBe(0);
  });

  it("reads the method from a Request object", async () => {
    const { win, replies } = fakeWindow();
    const answer = { ok: true };
    const request = win.fetch({ url: "/api/x", method: "DELETE" });
    expect(pendingWrites()).toBe(1);
    replies[0].resolve(answer);
    await expect(request).resolves.toBe(answer);
    expect(pendingWrites()).toBe(0);
  });

  it("installs once per window", async () => {
    const { win, replies } = fakeWindow();
    trackPendingWrites(win);
    const request = win.fetch("/api/x", { method: "POST" });
    expect(pendingWrites()).toBe(1);
    replies[0].resolve({ ok: true });
    await settle(request);
    expect(pendingWrites()).toBe(0);
  });
});
