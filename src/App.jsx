import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Notifications } from "@mantine/notifications";
import { Layout } from "./components/layout";
import DashboardNotifications from "./Modules/Dashboard/dashboardNotifications";
import RoleDashboard from "./Modules/Dashboard/RoleDashboard";
import Profile from "./Modules/Dashboard/StudentProfile/profilePage";
import LoginPage from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import AcademicPage from "./Modules/Academic/index";
import ValidateAuth from "./helper/validateauth";
import FacultyProfessionalProfile from "./Modules/facultyProfessionalProfile/facultyProfessionalProfile";
import Examination from "./Modules/Examination/examination";
import Database from "./Modules/Database/database";
import ProgrammeCurriculumRoutes from "./Modules/Program_curriculum/programmCurriculum";
import NotFoundPage from "./components/NotFoundPage";
import HR2Module from "./Modules/HRModule/index";
import HodLeaveApprovals from "./Modules/HRModule/HodLeaveApprovals";
import HodAppraisalReviews from "./Modules/HRModule/HodAppraisalReviews";
import DirectorLeaveApprovals from "./Modules/HRModule/DirectorLeaveApprovals";
import DirectorAppraisalReviews from "./Modules/HRModule/DirectorAppraisalReviews";
import DirectorCpdaApprovals from "./Modules/HRModule/DirectorCpdaApprovals";
import RegistrarLeaveApprovals from "./Modules/HRModule/RegistrarLeaveApprovals";
import HrAdminLtcReview from "./Modules/HRModule/HrAdminLtcReview";
import HrAdminCpdaReview from "./Modules/HRModule/HrAdminCpdaReview";
import AccountantLtcReview from "./Modules/HRModule/AccountantLtcReview";
import AccountantCpdaReview from "./Modules/HRModule/AccountantCpdaReview";

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
  const currentAccessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules,
  );
  const currentRole = useSelector((state) => state.user.role);
  const isHod = /hod/i.test(currentRole || "");
  const isDirector = /director/i.test(currentRole || "");
  const isRegistrar = /registrar/i.test(currentRole || "");
  const isHrAdmin = /hr/i.test(currentRole || "");
  const isAccountant = /accountant/i.test(currentRole || "");
  const canAccessHr =
    Boolean(currentAccessibleModules?.hr) ||
    /hod/i.test(currentRole || "") ||
    /director/i.test(currentRole || "") ||
    /registrar/i.test(currentRole || "") ||
    /accountant/i.test(currentRole || "") ||
    /hr/i.test(currentRole || "") ||
    Boolean(currentRole);
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-center" autoClose={2000} limit={1} />
      {location.pathname !== "/accounts/login" && <ValidateAuth />}
      {/* {location.pathname !== "/accounts/login" && <InactivityHandler />} */}

      <Routes>
        <Route path="/" element={<Navigate to="/accounts/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <RoleDashboard />
            </Layout>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <Layout>
              <DashboardNotifications />
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
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/examination/*" element={<Examination />} />
        <Route path="/database/*" element={<Database />} />
        <Route
          path="/hr2/*"
          element={
            canAccessHr ? (
              <Layout>
                <HR2Module />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/hod/leave-approvals"
          element={
            isHod ? (
              <Layout>
                <HodLeaveApprovals />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/hod/appraisal-reviews"
          element={
            isHod ? (
              <Layout>
                <HodAppraisalReviews />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/director/leave-approvals"
          element={
            isDirector ? (
              <Layout>
                <DirectorLeaveApprovals />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/registrar/leave-approvals"
          element={
            isRegistrar ? (
              <Layout>
                <RegistrarLeaveApprovals />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/director/appraisal-reviews"
          element={
            isDirector ? (
              <Layout>
                <DirectorAppraisalReviews />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/director/cpda-approvals"
          element={
            isDirector ? (
              <Layout>
                <DirectorCpdaApprovals />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/hr-admin/ltc-review"
          element={
            isHrAdmin ? (
              <Layout>
                <HrAdminLtcReview />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/hr-admin/cpda-review"
          element={
            isHrAdmin ? (
              <Layout>
                <HrAdminCpdaReview />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/accountant/ltc-review"
          element={
            isAccountant ? (
              <Layout>
                <AccountantLtcReview />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/hr2/accountant/cpda-review"
          element={
            isAccountant ? (
              <Layout>
                <AccountantCpdaReview />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MantineProvider>
  );
}
