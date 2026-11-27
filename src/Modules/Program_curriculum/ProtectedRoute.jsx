import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { matchesRole } from "../../ui/nav/roles";

// Who may open which programme-curriculum pages.
export const ADMIN_ROLES = ["acadadmin", "studentacadadmin"];
export const FACULTY_ROLES = [
  "Professor",
  "Assistant Professor",
  "Associate Professor",
  "Dean Academic",
  // every HOD role, whatever its discipline: "HOD (CSE)", "HOD (MT)", ...
  "HOD*",
];
export const STUDENT_ROLES = ["student", "Guest-User"];

export function ProtectedRoute({ allowedRoles, children }) {
  const role = useSelector((state) => state.user.role);
  const [isLoading, setIsLoading] = useState(role === "Guest-User");
  const [hasAccess, setHasAccess] = useState(matchesRole(role, allowedRoles));

  useEffect(() => {
    let timer;
    if (role === "Guest-User") {
      timer = setTimeout(() => {
        setHasAccess(matchesRole(role, allowedRoles));
        setIsLoading(false);
      }, 2000);
    } else {
      setHasAccess(matchesRole(role, allowedRoles));
      setIsLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [role, allowedRoles]);

  if (isLoading) return <div>Loading...</div>;
  return hasAccess ? children : <Navigate to="/dashboard" />;
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};
