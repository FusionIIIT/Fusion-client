import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { notificationsStore } from "@mantine/notifications";

// A tab that is already open keeps running the build it loaded, even after a
// new one is deployed. This hook asks the server for index.html now and then
// and, once that names different build files, loads the next page the user
// opens fresh. It never reloads the page being worked on, so nothing typed is
// lost: in-app navigation drops the old page anyway. It also waits while a
// message is on screen ("Saved", "Session expired", ...), which a reload would
// wipe, and on the way to the login page; a later page change loads fresh.

const CHECK_EVERY_MS = 5 * 60 * 1000;
const MIN_GAP_MS = 60 * 1000;
export const RELOADED_KEY = "fusion:reloadedForBuild";
// A reload that didn't bring the new build isn't retried for this long.
const RETRY_AFTER_MS = 30 * 60 * 1000;
const LOGIN_PATH = "/accounts/login";
const BUILD_FILES =
  'script[src*="/assets/"], link[rel="stylesheet"][href*="/assets/"]';

// The build files a page loads, e.g. "/assets/index-Ab12.css /assets/index-Cd34.js".
// Empty on the dev server, which serves sources rather than a build.
export function buildSignature(doc) {
  return Array.from(doc.querySelectorAll(BUILD_FILES))
    .map((el) => el.getAttribute("src") || el.getAttribute("href"))
    .sort()
    .join(" ");
}

// The build files the server's index.html names now; "" if it can't tell.
export async function fetchLatestSignature() {
  const response = await fetch("/", { cache: "no-cache" });
  if (!response.ok) return "";
  const html = await response.text();
  return buildSignature(new DOMParser().parseFromString(html, "text/html"));
}

// True when this tab already reloaded from `running` to get `latest` a short
// while ago and still runs `running`: something between it and the server
// served the old page, so another reload now would only repeat that. A time in
// the future (the clock was set back) counts as expired.
function reloadAlreadyFailed(running, latest) {
  try {
    const last = JSON.parse(sessionStorage.getItem(RELOADED_KEY));
    if (last?.from !== running || last?.to !== latest) return false;
    const age = Date.now() - last.at;
    return age >= 0 && age < RETRY_AFTER_MS;
  } catch {
    return false;
  }
}

function rememberReload(from, to) {
  try {
    sessionStorage.setItem(
      RELOADED_KEY,
      JSON.stringify({ from, to, at: Date.now() }),
    );
  } catch {
    // Storage blocked: the reload still happens, only the loop guard is lost.
  }
}

function messageShowing() {
  const { notifications = [], queue = [] } = notificationsStore.getState();
  return notifications.length > 0 || queue.length > 0;
}

export default function useReloadOnNewBuild({
  reload = () => window.location.reload(),
} = {}) {
  const { pathname } = useLocation();
  const running = useRef("");
  const newBuild = useRef("");

  useEffect(() => {
    running.current = buildSignature(document);
    if (!running.current) return undefined;

    // performance.now() keeps counting up if the system clock is set back.
    let lastCheck = -Infinity;
    const check = async () => {
      const now = performance.now();
      if (
        newBuild.current ||
        document.visibilityState === "hidden" ||
        now - lastCheck < MIN_GAP_MS
      ) {
        return;
      }
      lastCheck = now;
      try {
        const latest = await fetchLatestSignature();
        if (
          !latest ||
          latest === running.current ||
          reloadAlreadyFailed(running.current, latest)
        ) {
          return;
        }
        newBuild.current = latest;
      } catch {
        // Offline or the server is busy: the next check tries again.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    const timer = setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, []);

  // Runs when the path changes. On the first render no new build is known yet.
  useEffect(() => {
    if (!newBuild.current || pathname === LOGIN_PATH || messageShowing()) {
      return;
    }
    rememberReload(running.current, newBuild.current);
    reload();
  }, [pathname]);
}
