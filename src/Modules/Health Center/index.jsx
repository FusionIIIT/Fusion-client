import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader, Center } from "@mantine/core";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { CompounderRoutes } from "./Routes/CompounderRoutes";
import { StudentRoutes } from "./Routes/StudentRoutes";
import "./styles/healthCenter.css";

export function HealthCenter() {
  const role = useSelector((state) => state.user.role);
  const normalizedRole = String(role || "").toLowerCase();

  // Wait for the user role to hydrate from Redux
  if (normalizedRole === "guest-user") {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  const isCompounder = normalizedRole === "compounder";

  const getDefaultPath = () => {
    switch (normalizedRole) {
      case "compounder":
        return "/healthcenter/compounder";
      case "student":
      case "professor":
        return "/healthcenter/student";
      default:
        return "/healthcenter/student";
    }
  };

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultPath()} replace />} />

        <Route
          path="compounder/*"
          element={
            isCompounder ? (
              <CompounderRoutes />
            ) : (
              <Navigate to="/healthcenter/student" replace />
            )
          }
        />
        <Route 
          path="student/*" 
          element={
            !isCompounder ? (
              <StudentRoutes />
            ) : (
              <Navigate to="/healthcenter/compounder" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to={getDefaultPath()} replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default HealthCenter;
