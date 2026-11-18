import PropTypes from "prop-types";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useReloadOnNewBuild, { buildSignature } from "./useReloadOnNewBuild";
import { pendingWrites } from "./pendingWrites";

vi.mock("./pendingWrites", () => ({ pendingWrites: vi.fn(() => 0) }));

const OLD_JS = "/assets/index-old.js";
const OLD_CSS = "/assets/index-old.css";
const NEW_JS = "/assets/index-new.js";
const NEW_CSS = "/assets/index-new.css";
const KEY = "fusion:reloadedForBuild";
const sig = (...files) => files.sort().join(" ");
const RUNNING = sig(OLD_JS, OLD_CSS);
const MINUTE = 60 * 1000;

const indexHtml = (js, css) =>
  `<!doctype html><html><head>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <script type="module" crossorigin src="${js}"></script>
    <link rel="stylesheet" crossorigin href="${css}">
  </head><body><div id="root"></div></body></html>`;

function serve(html, { ok = true } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    text: () => Promise.resolve(html),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function Harness({ reload }) {
  useReloadOnNewBuild({ reload });
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate("/academics/next")}>next page</button>
      <button onClick={() => navigate("/academics/another")}>
        another page
      </button>
      <button onClick={() => navigate("?tab=2")}>other tab</button>
      <button onClick={() => navigate("/accounts/login")}>login page</button>
    </>
  );
}
Harness.propTypes = { reload: PropTypes.func.isRequired };

function renderApp() {
  const reload = vi.fn();
  render(
    <MemoryRouter
      initialEntries={["/academics/current"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Harness reload={reload} />
    </MemoryRouter>,
  );
  return reload;
}

// Let the check's fetch and parsing settle.
const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

async function focusTab() {
  await act(async () => {
    window.dispatchEvent(new Event("focus"));
    await settle();
  });
}

const openPage = (name) => fireEvent.click(screen.getByText(name));

// Fake timers that also move performance.now(), which the throttle uses.
const fakeClock = () =>
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "Date",
      "performance",
    ],
  });
const advance = (ms) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const fire = (target, type) =>
  act(async () => {
    target.dispatchEvent(new Event(type));
    await vi.advanceTimersByTimeAsync(0);
  });

beforeEach(() => {
  document.head.innerHTML = `<script type="module" src="${OLD_JS}"></script><link rel="stylesheet" href="${OLD_CSS}">`;
  sessionStorage.clear();
  pendingWrites.mockReturnValue(0);
});

afterEach(() => {
  notifications.clean();
  document.head.innerHTML = "";
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("buildSignature", () => {
  it("lists the build's script and stylesheet only, sorted", () => {
    const doc = new DOMParser().parseFromString(
      indexHtml(NEW_JS, NEW_CSS),
      "text/html",
    );
    expect(buildSignature(doc)).toBe(`${NEW_CSS} ${NEW_JS}`);
  });

  it("is empty on the dev server, which loads sources", () => {
    const doc = new DOMParser().parseFromString(
      '<script type="module" src="/src/main.jsx"></script>',
      "text/html",
    );
    expect(buildSignature(doc)).toBe("");
  });
});

describe("useReloadOnNewBuild", () => {
  it.each([
    ["a new script", NEW_JS, OLD_CSS],
    ["a stylesheet-only change", OLD_JS, NEW_CSS],
  ])(
    "after %s is deployed, reloads on the next page change, not before",
    async (_, js, css) => {
      const fetchMock = serve(indexHtml(js, css));
      const reload = renderApp();

      await focusTab();
      expect(fetchMock).toHaveBeenCalledWith("/", { cache: "no-cache" });
      expect(reload).not.toHaveBeenCalled();

      openPage("next page");
      expect(reload).toHaveBeenCalledTimes(1);
      expect(JSON.parse(sessionStorage.getItem(KEY))).toMatchObject({
        from: RUNNING,
        to: sig(js, css),
      });
    },
  );

  it("stays put while the server has the same build", async () => {
    serve(indexHtml(OLD_JS, OLD_CSS));
    const reload = renderApp();

    await focusTab();
    openPage("next page");
    expect(reload).not.toHaveBeenCalled();
  });

  it("waits for a different page, not a query-string change on the same one", async () => {
    serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await focusTab();
    openPage("other tab");
    expect(reload).not.toHaveBeenCalled();
    openPage("next page");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does nothing on the dev server", async () => {
    document.head.innerHTML =
      '<script type="module" src="/src/main.jsx"></script>';
    const fetchMock = serve(indexHtml(NEW_JS, NEW_CSS));
    const reload = renderApp();

    await focusTab();
    openPage("next page");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it("doesn't reload again soon for a build a reload already failed to bring", async () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        from: RUNNING,
        to: sig(NEW_JS, OLD_CSS),
        at: Date.now() - 29 * MINUTE,
      }),
    );
    serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await focusTab();
    openPage("next page");
    expect(reload).not.toHaveBeenCalled();
  });

  it.each([
    [
      "half an hour has passed",
      { from: RUNNING, at: Date.now() - 30 * MINUTE },
    ],
    [
      "the earlier reload was from another build (e.g. a rollback since)",
      { from: sig("/assets/index-older.js", OLD_CSS), at: Date.now() },
    ],
    [
      "its time is in the future (the clock was set back)",
      { from: RUNNING, at: Date.now() + 2 * 60 * MINUTE },
    ],
  ])("tries that build again once %s", async (_, earlier) => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...earlier, to: sig(NEW_JS, OLD_CSS) }),
    );
    serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await focusTab();
    openPage("next page");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("still picks up a newer build after a reload failed to bring the last one", async () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        from: RUNNING,
        to: sig(NEW_JS, OLD_CSS),
        at: Date.now() - 5 * MINUTE,
      }),
    );
    serve(indexHtml("/assets/index-newer.js", OLD_CSS));
    const reload = renderApp();

    await focusTab();
    openPage("next page");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("waits while a message is on screen, so a reload doesn't wipe it", async () => {
    serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await focusTab();
    act(() => {
      notifications.show({ title: "Saved", message: "Course added" });
    });
    openPage("next page");
    expect(reload).not.toHaveBeenCalled();

    act(() => notifications.clean());
    openPage("another page");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("waits while a save is still being sent, so a reload doesn't cancel it", async () => {
    serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await focusTab();
    pendingWrites.mockReturnValue(1);
    openPage("next page");
    expect(reload).not.toHaveBeenCalled();

    pendingWrites.mockReturnValue(0);
    openPage("another page");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("leaves the way to the login page alone, so its message stays", async () => {
    serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await focusTab();
    openPage("login page");
    expect(reload).not.toHaveBeenCalled();
    openPage("next page");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "the server answers with an error",
      () => serve(indexHtml(NEW_JS, OLD_CSS), { ok: false }),
    ],
    [
      "the request fails",
      () => vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("x"))),
    ],
    [
      "the page names no build files",
      () => serve("<html><body>Maintenance</body></html>"),
    ],
  ])("ignores a check where %s", async (_, setUp) => {
    setUp();
    const reload = renderApp();

    await focusTab();
    openPage("next page");
    expect(reload).not.toHaveBeenCalled();
  });

  it("checks when the tab becomes visible", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    const fetchMock = serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await settle();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    openPage("next page");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("makes one check when a tab switch fires focus and visibility together", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    const fetchMock = serve(indexHtml(OLD_JS, OLD_CSS));
    renderApp();

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("focus"));
      await settle();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("checks at most once a minute", async () => {
    fakeClock();
    const fetchMock = serve(indexHtml(OLD_JS, OLD_CSS));
    renderApp();

    await fire(window, "focus");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(59 * 1000);
    await fire(window, "focus");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(2 * 1000);
    await fire(window, "focus");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps checking after the system clock is set back", async () => {
    fakeClock();
    const fetchMock = serve(indexHtml(OLD_JS, OLD_CSS));
    renderApp();

    await fire(window, "focus");
    vi.setSystemTime(Date.now() - 2 * 60 * MINUTE);
    await advance(5 * MINUTE);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("doesn't check while the tab is hidden", async () => {
    fakeClock();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    const fetchMock = serve(indexHtml(NEW_JS, OLD_CSS));
    renderApp();

    await advance(11 * MINUTE);
    await fire(window, "focus");
    await fire(document, "visibilitychange");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("checks every five minutes while the tab stays open", async () => {
    fakeClock();
    const fetchMock = serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await advance(4 * MINUTE);
    expect(fetchMock).not.toHaveBeenCalled();
    await advance(MINUTE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    openPage("next page");
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
