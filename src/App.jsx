import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Notifications } from "@mantine/notifications";
import { Layout } from "./components/layout";
import Dashboard from "./Modules/Dashboard/dashboardNotifications";
import Profile from "./Modules/Dashboard/StudentProfile/profilePage";
import LoginPage from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import AcademicPage from "./Modules/Academic/index";
import OnlineCmsRoutes from "./routes/online_cmsRoutes";
import ValidateAuth from "./helper/validateauth";

function LegacyOnlineCmsRedirect() {
  const location = useLocation();
  const nextPathname = location.pathname.replace(/^\/online_cms(\/|$)/, "/online-cms$1");
  return <Navigate to={`${nextPathname}${location.search}${location.hash}`} replace />;
}

export default function App() {
  const location = useLocation();
  return (
    <MantineProvider>
      <Notifications
        position="top-right"
        zIndex={1000}
        autoClose={2000}
        limit={1}
      />
      {location.pathname !== "/accounts/login" &&
        location.pathname !== "/reset-password" && <ValidateAuth />}
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
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/online-cms/*"
          element={
            <Layout>
              <OnlineCmsRoutes />
            </Layout>
          }
        />

        {/* Backward-compatible alias for underscore-style URL */}
        <Route path="/online_cms" element={<LegacyOnlineCmsRedirect />} />
        <Route path="/online_cms/*" element={<LegacyOnlineCmsRedirect />} />

        <Route path="/accounts/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
      </Routes>
    </MantineProvider>
  );
}
