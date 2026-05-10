import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Notifications } from "@mantine/notifications";
import { Layout } from "./components/layout";
import Dashboard from "./Modules/Dashboard/dashboardNotifications";
import Profile from "./Modules/Dashboard/StudentProfile/profilePage";
import LoginPage from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import AcademicPage from "./Modules/Academic/index";
import ValidateAuth from "./helper/validateauth";
import FacultyProfessionalProfile from "./Modules/facultyProfessionalProfile/facultyProfessionalProfile";
import InactivityHandler from "./helper/inactivityhandler";
import Examination from "./Modules/Examination/examination";
import Database from "./Modules/Database/database";
import ProgrammeCurriculumRoutes from "./Modules/Program_curriculum/programmCurriculum";
import PatentModulePage from "./Modules/Patent/PatentModulePage";
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

function RequireAuth({ children }) {
  const currentLocation = useLocation();
  const token = localStorage.getItem("authToken");

  if (!token) {
    return (
      <Navigate
        to="/accounts/login"
        replace
        state={{ from: currentLocation.pathname }}
      />
    );
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function App() {
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem("authToken"));

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-center" autoClose={2000} limit={1} />
      {location.pathname !== "/accounts/login" && hasToken && <ValidateAuth />}
      {location.pathname !== "/accounts/login" && hasToken && (
        <InactivityHandler />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={hasToken ? "/dashboard" : "/accounts/login"}
              replace
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Layout>
                <Dashboard />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/academics"
          element={
            <RequireAuth>
              <Layout>
                <AcademicPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Layout>
                <Profile />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/facultyprofessionalprofile/*"
          element={
            <RequireAuth>
              <Layout>
                <FacultyProfessionalProfile />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/programme_curriculum/*"
          element={
            <RequireAuth>
              <div>
                <ProgrammeCurriculumRoutes />
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/patentsystem/*"
          element={
            <RequireAuth>
              <Layout>
                <PatentModulePage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route path="/accounts/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route
          path="/examination/*"
          element={
            <RequireAuth>
              <Examination />
            </RequireAuth>
          }
        />
        <Route
          path="/database/*"
          element={
            <RequireAuth>
              <Database />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MantineProvider>
  );
}
