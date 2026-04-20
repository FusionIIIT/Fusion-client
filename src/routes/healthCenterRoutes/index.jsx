/**
 * HealthCenter Routes
 * ====================
 * Defines the module-level routing for the PHC frontend module.
 *
 * Mounted in App.jsx as:
 *   <Route path="/health-center/*" element={<HealthCenterRoutes />} />
 *
 * Available routes:
 *   /health-center/patient     → PatientDashboard
 *   /health-center/compounder  → CompoundDashboard
 *   /health-center/           → Routes to appropriate dashboard based on role
 */

import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Layout } from "../../components/layout";
import PatientDashboard from "../../Modules/HealthCenter/PatientDashboard";
import CompoundDashboard from "../../Modules/HealthCenter/CompoundDashboard";

const CompounderRoles = ["Health Center Doctor", "Health Center Pathologist", "Doctor", "Pathologist", "compounder"];

export default function HealthCenterRoutes() {
  const roles = useSelector((state) => state.user.roles || []);
  
  // Determine user role
  const isCompounder = roles.some((role) => CompounderRoles.includes(role));
  
  // Route based on priority: compounder > patient
  const defaultPath = isCompounder ? "compounder" : "patient";

  return (
    <Layout>
      <Routes>
        <Route path="patient" element={<PatientDashboard />} />
        <Route path="compounder" element={<CompoundDashboard />} />
        <Route index element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </Layout>
  );
}
