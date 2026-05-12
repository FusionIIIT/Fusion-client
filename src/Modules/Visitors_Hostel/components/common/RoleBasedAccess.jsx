/**
 * RoleBasedAccess
 * Component for conditionally rendering content based on user role
 * 
 * Supported roles:
 * - VhIncharge: Full access to all booking management features
 * - Student: Can only create bookings and view own bookings
 * - AccountsOfficer: Can view bills and financial reports
 */

import React from "react";
import { useSelector } from "react-redux";
import { Alert, Text, Box } from "@mantine/core";

export const ROLES = {
  VH_INCHARGE: "VhIncharge",
  STUDENT: "Student",
  ACCOUNTS_OFFICER: "AccountsOfficer",
};

/**
 * Component that conditionally renders children based on user role
 * 
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - Array of roles that can access this content
 * @param {React.ReactNode} props.children - Content to render if user has allowed role
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have access (optional)
 * @param {boolean} props.showMessage - Show message when access is denied (default: true)
 */
function RoleBasedAccess({ allowedRoles, children, fallback, showMessage = true }) {
  const user = useSelector((state) => state.user?.user);
  const userRole = user?.role;

  // Check if user has an allowed role
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    if (showMessage) {
      return (
        <Alert type="error" title="Access Denied">
          <Text size="sm">
            You don't have permission to access this content. Required role: {allowedRoles.join(" or ")}
          </Text>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component to wrap a component with role-based access control
 * 
 * @param {React.Component} Component - Component to wrap
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @param {React.ReactNode} fallback - Fallback component to render
 */
export function withRoleAccess(Component, allowedRoles, fallback) {
  return function ProtectedComponent(props) {
    return (
      <RoleBasedAccess allowedRoles={allowedRoles} fallback={fallback}>
        <Component {...props} />
      </RoleBasedAccess>
    );
  };
}

/**
 * Hook to check if current user has a specific role
 */
export function useCanAccess(allowedRoles) {
  const user = useSelector((state) => state.user?.user);
  const userRole = user?.role;
  
  return allowedRoles.includes(userRole);
}

export default RoleBasedAccess;
