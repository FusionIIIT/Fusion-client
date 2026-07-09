import { createTheme, MantineProvider, Center, Loader } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Notifications } from "@mantine/notifications";
import { Layout } from "./components/layout";
import Dashboard from "./Modules/Dashboard/dashboardNotifications";
import Profile from "./Modules/Dashboard/StudentProfile/profilePage";
import LoginPage from "./pages/login";
import ThesisInvitationResponse from "./pages/thesisInvitationResponse";
import ThesisEvaluationForm from "./pages/thesisEvaluationForm";
import AcademicPage from "./Modules/Academic/index";
import ThesisResearchPage from "./Modules/ThesisResearch/index";
import ValidateAuth from "./helper/validateauth";
import FacultyProfessionalProfile from "./Modules/facultyProfessionalProfile/facultyProfessionalProfile";
import InactivityHandler from "./helper/inactivityhandler";
import Examination from "./Modules/Examination/examination";
import Database from "./Modules/Database/database";
import ProgrammeCurriculumRoutes from "./Modules/Program_curriculum/programmCurriculum";
import NotFoundPage from "./components/NotFoundPage";

const theme = createTheme({
  breakpoints: {
    xxs: "300px",
    xs: "375px",
    sm: "768px",
    md: "992px",
    lg: "1200px",
    xl: "1408px",
  },
});

export default function App() {
  const location = useLocation();

  // True immediately when sessionStorage already has the token (normal in-session
  // navigation), or when there is no token at all (fresh visit / already logged out).
  // False only when localStorage has a token but sessionStorage doesn't — that
  // happens after a browser/tab close and requires a BroadcastChannel check to
  // determine whether the token is still backed by a live tab or is stale.
  const [sessionReady, setSessionReady] = useState(() => {
    const sessionToken = sessionStorage.getItem("authToken");
    const localToken = localStorage.getItem("authToken");
    return !!(sessionToken || !localToken);
  });

  // Permanent responder: reply to SESSION_CHECK messages from other tabs that
  // are trying to determine if their localStorage token is still live.
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("fusion-auth-session");
    const onMessage = (event) => {
      const msg = event?.data;
      if (msg?.type === "SESSION_CHECK" && sessionStorage.getItem("authToken")) {
        channel.postMessage({ type: "SESSION_ACTIVE", requestId: msg.requestId });
      }
    };
    channel.addEventListener("message", onMessage);
    return () => {
      channel.removeEventListener("message", onMessage);
      channel.close();
    };
  }, []);

  // One-time initializer: resolve the ambiguous case where localStorage has a
  // token but sessionStorage doesn't (browser/tab was closed and reopened).
  // Waits up to 400 ms for another active tab to confirm the session; if none
  // responds the token is treated as stale and removed.
  useEffect(() => {
    if (sessionReady) return;

    const tokenKey = "authToken";

    if (typeof BroadcastChannel === "undefined") {
      localStorage.removeItem(tokenKey);
      setSessionReady(true);
      return;
    }

    const channel = new BroadcastChannel("fusion-auth-session");
    const requestId = `init-${Math.random()}`;
    let confirmed = false;

    const onMessage = (event) => {
      const msg = event?.data;
      if (msg?.type === "SESSION_ACTIVE" && msg.requestId === requestId) {
        confirmed = true;
        const token = localStorage.getItem(tokenKey);
        if (token) sessionStorage.setItem(tokenKey, token);
        setSessionReady(true);
      }
    };

    channel.addEventListener("message", onMessage);
    channel.postMessage({ type: "SESSION_CHECK", requestId });

    const timer = setTimeout(() => {
      if (!confirmed) {
        localStorage.removeItem(tokenKey);
      }
      setSessionReady(true);
    }, 400);

    return () => {
      clearTimeout(timer);
      channel.removeEventListener("message", onMessage);
      channel.close();
    };
  }, [sessionReady]);

  // Backward-compat: keep localStorage in sync with sessionStorage so that
  // existing API callers which still read authToken from localStorage work.
  useEffect(() => {
    const sessionToken = sessionStorage.getItem("authToken");
    if (sessionToken && !localStorage.getItem("authToken")) {
      localStorage.setItem("authToken", sessionToken);
    }
  }, []);

  if (!sessionReady) {
    return (
      <MantineProvider theme={theme}>
        <Center h="100vh">
          <Loader size="md" />
        </Center>
      </MantineProvider>
    );
  }

  // Public, token-authenticated pages reached from emailed links (external
  // thesis examiners have no Fusion account) must skip the session-token
  // guard and inactivity timeout, same as the login page.
  const isPublicRoute = location.pathname === "/accounts/login"
    || location.pathname === "/reset-password"
    || location.pathname.startsWith("/thesis-invitation/")
    || location.pathname.startsWith("/thesis-evaluation/");

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-center" autoClose={2000} limit={1} />
      {!isPublicRoute && <ValidateAuth />}
      {!isPublicRoute && <InactivityHandler />}

      <Routes>
        <Route path="/" element={<Navigate to="/accounts/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/academics"
          element={
            <Layout>
              <AcademicPage />
            </Layout>
          }
        />
        <Route
          path="/thesis-research"
          element={
            <Layout>
              <ThesisResearchPage />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/facultyprofessionalprofile/*"
          element={
            <Layout>
              <FacultyProfessionalProfile />
            </Layout>
          }
        />
        <Route
          path="/programme_curriculum/*"
          element={
            <div>
              <ProgrammeCurriculumRoutes />
            </div>
          }
        />
        <Route path="/accounts/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<Navigate to="/accounts/login" replace />} />
        <Route path="/thesis-invitation/:token/:action" element={<ThesisInvitationResponse />} />
        <Route path="/thesis-evaluation/:token" element={<ThesisEvaluationForm />} />
        <Route path="/examination/*" element={<Examination />} />
        <Route path="/database/*" element={<Database />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MantineProvider>
  );
}
