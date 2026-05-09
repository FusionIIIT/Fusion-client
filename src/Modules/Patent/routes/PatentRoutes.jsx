import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Layout } from "../../../components/layout";

import ApplicantMainDashboard from "../components/Applicant/ApplicantMainDashboard";
import DirectorMainDashboard from "../components/Director/DirectorMainDashboard";
import PCCAdminMainDashboard from "../components/PCCAdmin/PCCAdminMainDashboard";
import PCCStatusView from "../components/PCCAdmin/PCCAStatusView";

export default function PatentRoutes() {
  const role = useSelector((state) => state.user.role);

  // Debug: Log the role to console
  console.log("Patent Routes - Current Role:", role);

  // If role is not loaded yet or is Guest-User, don't redirect to dashboard immediately
  if (!role || role === "Guest-User") {
    return (
      <Layout>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Loading Patent Management System...</h2>
          <p>Please wait while we verify your access.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Routes>
      {/* Applicant Routes - Only for applicants or inventors */}
      {[
        "student",
        "alumini",
        "Professor",
        "Associate Professor",
        "Assistant Professor",
        "Research Engineer",
      ].includes(role) && (
        <Route
          path="/applicant/"
          element={
            <Layout>
              <ApplicantMainDashboard />
            </Layout>
          }
        />
      )}

      {/* Director Routes - Only for Director */}
      {role === "Director" && (
        <Route
          path="/director"
          element={
            <Layout>
              <DirectorMainDashboard />
            </Layout>
          }
        />
      )}

      {/* PCC Admin Routes - Only for PCC Admin */}
      {role === "PCC Admin" && (
        <Route
          path="/pccAdmin/"
          element={
            <Layout>
              <PCCAdminMainDashboard />
            </Layout>
          }
        />
      )}

      {role === "PCC Admin" && (
        <Route
          path="/pccAdmin/application/view-details"
          element={
            <Layout>
              <PCCStatusView />
            </Layout>
          }
        />
      )}

      {/* Default route - redirect to role-specific dashboard */}
      <Route
        path="/"
        element={
          role === "Director" ? (
            <Navigate to="/patent/director" replace />
          ) : role === "PCC Admin" ? (
            <Navigate to="/patent/pccAdmin/" replace />
          ) : [
              "student",
              "alumini",
              "Professor",
              "Associate Professor",
              "Assistant Professor",
              "Research Engineer",
            ].includes(role) ? (
            <Navigate to="/patent/applicant/" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Redirect users without access or unmatched routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
