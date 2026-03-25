import { useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { notifications } from "@mantine/notifications";
import api from "./api"; // MUST use named import to ensure interceptor connects
import { tokenStorage } from "./tokenStorage";
import {
  setUserName,
  setRollNo,
  setRoles,
  setRole,
  setAccessibleModules,
  setCurrentAccessibleModules,
  clearUserName,
  clearRoles,
} from "../redux/userslice";

function ValidateAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasLoggedErrorRef = useRef(false);

  const validateUser = useCallback(async () => {
    // Skip auth check if we are already on login page or other public pages
    if (
      location.pathname === "/accounts/login" ||
      location.pathname === "/login"
    ) {
      return;
    }

    const token = tokenStorage.getAccess();
    if (!token) {
      if (!hasLoggedErrorRef.current) {
        hasLoggedErrorRef.current = true;
        navigate("/login");
      }
      return;
    }

    try {
      // We must explicitly ensure we add the trailing slash in the URL since Django strictly expects it!
      const { data } = await api.get("/api/auth/me/");

      dispatch(setUserName(data.username));
      dispatch(setRollNo(data.username));

      const rolesToSet = data.roles || ["student", "faculty", "admin"];
      const roleToSet = data.role || "student";
      const modulesToSet = data.accessibleModules || {};

      if (modulesToSet[roleToSet]) {
        modulesToSet[roleToSet] = {
          ...modulesToSet[roleToSet],
          online_cms: true,
        };
      }

      dispatch(setRoles(rolesToSet));
      dispatch(setRole(roleToSet));
      dispatch(setAccessibleModules(modulesToSet));
      dispatch(setCurrentAccessibleModules());

      hasLoggedErrorRef.current = false;
    } catch (error) {
      tokenStorage.clear();
      dispatch(clearUserName());
      dispatch(clearRoles());

      if (!hasLoggedErrorRef.current) {
        hasLoggedErrorRef.current = true;
        notifications.show({
          title: "Session Expired",
          message: "Your session has expired. Please log in again.",
          color: "red",
        });
      }
      navigate("/login");
    }
  }, [dispatch, navigate, location.pathname]);

  useEffect(() => {
    validateUser();
  }, [validateUser]);

  return null;
}

export default ValidateAuth;
