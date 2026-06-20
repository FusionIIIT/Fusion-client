import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { showNotification } from "@mantine/notifications";

export function ProtectedDatabaseRoute({ children, requiredRole = null }) {
  const userRole = useSelector((state) => state.user.role);
  const currentAccessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules || {},
  );
  const notificationShownRef = useRef(false);
  const isLoading = !userRole;

  const hasDatabaseAccess = currentAccessibleModules.database === true;

  useEffect(() => {
    if (!isLoading && !hasDatabaseAccess && !notificationShownRef.current) {
      notificationShownRef.current = true;
      showNotification({
        title: "Access Denied",
        message:
          "You do not have permission to access the Database module. Please contact your administrator.",
        color: "red",
        autoClose: 5000,
      });
    }
  }, [isLoading, hasDatabaseAccess]);

  if (isLoading) {
    return null;
  }

  if (!hasDatabaseAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

ProtectedDatabaseRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedDatabaseRoute;
