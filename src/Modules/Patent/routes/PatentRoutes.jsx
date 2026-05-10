import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Layout } from "../../../components/layout";

import PCCStatusView from "../components/PCCAdmin/PCCAStatusView";
import PatentModulePage from "../pages/PatentModulePage";

export default function PatentRoutes() {
  const role = useSelector((state) => state.user.role);

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
              <PatentModulePage role={role} />
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
              <PatentModulePage role={role} />
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
              <PatentModulePage role={role} />
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

      {/* Redirect users without access */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
