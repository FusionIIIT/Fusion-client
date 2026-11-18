import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// A tab that is already open keeps running the build it loaded, even after a
// new one is deployed. This hook asks the server for index.html now and then
// and, once that names different build files, loads the next page the user
// opens fresh. It never reloads the page being worked on, so nothing typed is
// lost: in-app navigation drops the old page anyway.

const CHECK_EVERY_MS = 5 * 60 * 1000;
const MIN_GAP_MS = 60 * 1000;
const RELOADED_FOR_KEY = "fusion:reloadedForBuild";
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

function readReloadedFor() {
  try {
    return sessionStorage.getItem(RELOADED_FOR_KEY);
  } catch {
    return null;
  }
}

function rememberReloadFor(signature) {
  try {
    sessionStorage.setItem(RELOADED_FOR_KEY, signature);
  } catch {
    // Storage blocked: the reload still happens, only the loop guard is lost.
  }
}

export default function useReloadOnNewBuild({
  reload = () => window.location.reload(),
} = {}) {
  const { pathname } = useLocation();
  const newBuild = useRef("");
  const previousPath = useRef(pathname);

  useEffect(() => {
    const running = buildSignature(document);
    if (!running) return undefined;

    let lastCheck = 0;
    let stopped = false;
    const check = async () => {
      const now = Date.now();
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
        // Skip a build this tab already reloaded for and still didn't get
        // (something between us and the server served the old page), so it
        // can't reload on every page change.
        if (
          stopped ||
          !latest ||
          latest === running ||
          readReloadedFor() === latest
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
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, []);

  useEffect(() => {
    if (pathname === previousPath.current) return;
    previousPath.current = pathname;
    if (!newBuild.current) return;
    rememberReloadFor(newBuild.current);
    reload();
  }, [pathname]);
}
