import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Center, Stack, Text, Button } from "@mantine/core";

/**
 * ProtectedRoute Component
 * Checks if user has required roles/accessible modules before rendering component
 * 
 * @param {React.Component} element - Component to render if authorized
 * @param {Array<string>} requiredRoles - Array of roles that can access (e.g., ['acadadmin', 'student'])
 * @param {Array<string>} requiredModules - Array of modules that can access (checked against accessible_modules)
 * @param {boolean} requireAll - If true, user must have ALL required roles/modules. If false, ANY one.
 */
export const ProtectedRoute = ({
  element,
  requiredRoles = [],
  requiredModules = [],
  requireAll = false,
}) => {
  const userRoles = useSelector((state) => state.user.roles || []);
  const currentRole = useSelector((state) => state.user.role);
  const accessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules || {}
  );

  // Check role authorization
  const hasRequiredRole =
    requiredRoles.length === 0 || // If no specific roles required, allow
    (requireAll
      ? requiredRoles.every((role) => userRoles.includes(role)) // User must have ALL roles
      : requiredRoles.some((role) => userRoles.includes(role))); // User must have ANY role

  // Check module authorization
  const hasRequiredModule =
    requiredModules.length === 0 || // If no specific modules required, allow
    (requireAll
      ? requiredModules.every((module) => accessibleModules[module]) // User must have access to ALL modules
      : requiredModules.some((module) => accessibleModules[module])); // User must have access to ANY module

  // User is authorized
  if (hasRequiredRole && hasRequiredModule) {
    return element;
  }

  // User is not authorized - show access denied page
  return (
    <Center style={{ height: "100vh" }}>
      <Stack align="center" spacing="lg">
        <div style={{ textAlign: "center" }}>
          <Text size="xl" weight={700} color="red">
            Access Denied
          </Text>
          <Text color="dimmed" mt="md">
            You don't have permission to access this page.
          </Text>
          {requiredRoles.length > 0 && (
            <Text size="sm" color="dimmed">
              Required Roles: {requiredRoles.join(", ")}
            </Text>
          )}
          {requiredModules.length > 0 && (
            <Text size="sm" color="dimmed">
              Required Access: {requiredModules.join(", ")}
            </Text>
          )}
          <Text size="sm" color="dimmed" mt="sm">
            Your current role: <strong>{currentRole}</strong>
          </Text>
        </div>
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          variant="light"
        >
          Return to Dashboard
        </Button>
      </Stack>
    </Center>
  );
};

export default ProtectedRoute;
