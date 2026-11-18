import PropTypes from "prop-types";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useReloadOnNewBuild, { buildSignature } from "./useReloadOnNewBuild";

const OLD_JS = "/assets/index-old.js";
const OLD_CSS = "/assets/index-old.css";
const NEW_JS = "/assets/index-new.js";
const NEW_CSS = "/assets/index-new.css";
const KEY = "fusion:reloadedForBuild";

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
      <button onClick={() => navigate("?tab=2")}>other tab</button>
    </>
  );
}
Harness.propTypes = { reload: PropTypes.func.isRequired };

function renderApp() {
  const reload = vi.fn();
  render(
    <MemoryRouter initialEntries={["/academics/current"]}>
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

beforeEach(() => {
  document.head.innerHTML = `<script type="module" src="${OLD_JS}"></script><link rel="stylesheet" href="${OLD_CSS}">`;
  sessionStorage.clear();
});

afterEach(() => {
  document.head.innerHTML = "";
  vi.unstubAllGlobals();
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
      expect(sessionStorage.getItem(KEY)).toBe([js, css].sort().join(" "));
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

  it("doesn't reload again for a build a reload already failed to bring", async () => {
    sessionStorage.setItem(KEY, [NEW_JS, OLD_CSS].sort().join(" "));
    serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await focusTab();
    openPage("next page");
    expect(reload).not.toHaveBeenCalled();
  });

  it.each([
    ["the server answers with an error", () => serve("", { ok: false })],
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

  it("checks at most once a minute, and not while the tab is hidden", async () => {
    const fetchMock = serve(indexHtml(OLD_JS, OLD_CSS));
    renderApp();

    await focusTab();
    await focusTab();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockClear();
    const visibility = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    vi.useFakeTimers();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(fetchMock).not.toHaveBeenCalled();
    visibility.mockRestore();
  });

  it("checks every five minutes while the tab stays open", async () => {
    vi.useFakeTimers();
    const fetchMock = serve(indexHtml(NEW_JS, OLD_CSS));
    const reload = renderApp();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    openPage("next page");
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
