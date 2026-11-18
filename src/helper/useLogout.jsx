import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showNotification } from "@mantine/notifications";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import axios from "axios";
import { logoutRoute } from "../routes/dashboardRoutes";
import { RELOADED_KEY } from "./useReloadOnNewBuild";

const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async ({ reason } = {}) => {
    const token = localStorage.getItem("authToken");

    try {
      if (token) {
        await axios.post(
          logoutRoute,
          {},
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      // Keep the new-build reload guard, which belongs to the tab, not the session.
      const reloadGuard = sessionStorage.getItem(RELOADED_KEY);
      sessionStorage.clear();
      if (reloadGuard) sessionStorage.setItem(RELOADED_KEY, reloadGuard);
      dispatch({ type: "RESET_STORE" });

      showNotification(
        reason === "inactivity"
          ? {
              title: "Logged out",
              message:
                "You were logged out due to inactivity. Please log in again.",
              color: "red",
              icon: <XCircle size={18} />,
            }
          : {
              title: "Logged out",
              message: "You have been logged out successfully.",
              color: "green",
              icon: <CheckCircle size={18} />,
            },
      );

      navigate("/accounts/login");
    }
  };

  return { handleLogout };
};

export default useLogout;
