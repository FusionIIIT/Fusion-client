import { useEffect, useRef } from "react";
import useLogout from "./useLogout";

const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutes
const PERSIST_INTERVAL = 30 * 1000; // throttle for the persisted timestamp
const LAST_ACTIVITY_KEY = "lastActivity";
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "click",
  "wheel",
  "scroll",
  "touchstart",
];

function InactivityHandler() {
  const timerRef = useRef(null);
  const lastPersistRef = useRef(0);
  const { handleLogout } = useLogout();
  const logoutRef = useRef(handleLogout);
  logoutRef.current = handleLogout;

  useEffect(() => {
    // If the app was closed (tab shut, system powered off) and the session sat
    // idle past the limit, end it the moment we load back in.
    const token = localStorage.getItem("authToken");
    const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    if (token && last && Date.now() - last > INACTIVITY_TIME) {
      logoutRef.current({ reason: "inactivity" });
      return undefined;
    }

    const resetTimer = () => {
      const now = Date.now();
      if (now - lastPersistRef.current > PERSIST_INTERVAL) {
        lastPersistRef.current = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        logoutRef.current({ reason: "inactivity" });
      }, INACTIVITY_TIME);
    };

    const options = { capture: true, passive: true };
    ACTIVITY_EVENTS.forEach((event) =>
      document.addEventListener(event, resetTimer, options),
    );
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        document.removeEventListener(event, resetTimer, options),
      );
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}

export default InactivityHandler;
