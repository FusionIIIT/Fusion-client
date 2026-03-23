import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { CompounderRoutes } from "./Routes/CompounderRoutes";
import { StudentRoutes } from "./Routes/StudentRoutes";
import "./styles/healthCenter.css";

export function HealthCenter() {
  const role = useSelector((state) => state.user.role);

  const getDefaultPath = () => {
    switch (role) {
      case "Compounder":
        return "/healthcenter/compounder";
      case "student" || "Professor":
        return "/healthcenter/student";
      default:
        return "/healthcenter/student";
    }
  };

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultPath()} replace />} />

        <Route path="compounder/*" element={<CompounderRoutes />} />
        <Route path="student/*" element={<StudentRoutes />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default HealthCenter;
