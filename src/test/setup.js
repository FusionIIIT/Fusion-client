import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const realError = console.error;

const format = (args) => {
  let i = 1;
  return String(args[0]).replace(/%s/g, () => String(args[i++] ?? ""));
};

let propTypeFailures = [];

beforeEach(() => {
  propTypeFailures = [];
  vi.spyOn(console, "error").mockImplementation((...args) => {
    if (/Failed\s+(%s|prop)\s+type/.test(String(args[0]))) {
      propTypeFailures.push(format(args).split("\n")[0]);
      return;
    }
    realError(...args);
  });
});

// Unmount React trees between tests to avoid cross-test leakage.
afterEach(() => {
  cleanup();
  const failures = [...new Set(propTypeFailures)];
  propTypeFailures = [];
  if (failures.length)
    throw new Error(`propType violation:\n${failures.join("\n")}`);
});

// jsdom does not implement matchMedia / ResizeObserver, which Mantine relies on.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (!window.ResizeObserver) {
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}
