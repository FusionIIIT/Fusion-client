import { MantineProvider, createTheme } from "@mantine/core";
import { Suspense, lazy } from "react";
import { useSelector } from "react-redux";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { Notifications } from "@mantine/notifications";
import { host } from "./routes/globalRoutes";
import { Layout } from "./components/layout";
import PatentRoutes from "./Modules/Patent/routes/PatentRoutes";

// Working module imports
const Dashboard = lazy(
  () => import("./Modules/Dashboard/dashboardNotifications"),
);
const Profile = lazy(
  () => import("./Modules/Dashboard/StudentProfile/profilePage"),
);
const LoginPage = lazy(() => import("./pages/login"));
const ForgotPassword = lazy(() => import("./pages/forgotPassword"));
const AcademicPage = lazy(() => import("./Modules/Academic/index"));
const ValidateAuth = lazy(() => import("./helper/validateauth"));
const MessPage = lazy(() => import("./Modules/Mess/messContent"));
const FacultyProfessionalProfile = lazy(
  () =>
    import("./Modules/facultyProfessionalProfile/facultyProfessionalProfile"),
);
const InactivityHandler = lazy(() => import("./helper/inactivityhandler.js"));
const Examination = lazy(() => import("./Modules/Examination/examination"));
const ProgrammeCurriculumRoutes = lazy(
  () => import("./Modules/Program_curriculum/programmCurriculum"),
);

const theme = createTheme({
  breakpoints: { xs: "30em", sm: "48em", md: "64em", lg: "74em", xl: "90em" },
});

function ProfileRouteWithUsername() {
  const { username } = useParams();
  return <Profile connectionRoute={`${host}/dep/api/profile/${username}/`} />;
}

export default function App() {
  const location = useLocation();
  const role = useSelector((state) => state.user.role);

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-center" autoClose={2000} limit={1} />

      {![
        "/accounts/login",
        "/reset-password",
      ].includes(location.pathname) && <ValidateAuth />}
      {location.pathname !== "/accounts/login" && <InactivityHandler />}

      <Routes>
        <Route path="/" element={<Navigate to="/accounts/login" replace />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Suspense fallback={<div>Loading .... </div>}>
                <Dashboard />
              </Suspense>
            </Layout>
          }
        />

        <Route
          path="/academics"
          element={
            <Layout>
              <Suspense fallback={<div>Loading .... </div>}>
                <AcademicPage />
              </Suspense>
            </Layout>
          }
        />

        <Route
          path="/programme_curriculum/*"
          element={
            <Layout>
              <Suspense fallback={<div>Loading .... </div>}>
                <ProgrammeCurriculumRoutes />
              </Suspense>
            </Layout>
          }
        />

        <Route
          path="/examination/*"
          element={
            <Layout>
              <Suspense fallback={<div>Loading .... </div>}>
                <Examination />
              </Suspense>
            </Layout>
          }
        />

        <Route
          path="/mess"
          element={
            <Layout>
              <Suspense fallback={<div>Loading .... </div>}>
                <MessPage />
              </Suspense>
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Suspense fallback={<div>Loading .... </div>}>
                <Profile />
              </Suspense>
            </Layout>
          }
        />

        <Route
          path="/profile/:username"
          element={
            <Layout>
              <Suspense fallback={<div>Loading .... </div>}>
                <ProfileRouteWithUsername />
              </Suspense>
            </Layout>
          }
        />

        <Route
          path="/facultyprofessionalprofile/*"
          element={
            <Layout>
              <Suspense fallback={<div>Loading .... </div>}>
                <FacultyProfessionalProfile />
              </Suspense>
            </Layout>
          }
        />

        <Route path="/patent/*" element={<PatentRoutes />} />

        <Route path="/accounts/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />

        {/* Catch-all route for modules not yet implemented */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MantineProvider>
  );
}
