import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { logoutRoute } from "../routes/dashboardRoutes";
import api from "./api";
import { tokenStorage } from "./tokenStorage";

const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      try {
        await api.post(logoutRoute, {});
      } catch (e) {
        console.error("Backend logout error", e);
      }
      localStorage.removeItem("authToken");
      tokenStorage.clear();
      navigate("/login");

      showNotification({
        title: "Logged Out",
        message: "You have been logged out successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      console.log("User logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      showNotification({
        title: "Logout Failed",
        message: "There was an issue logging you out. Please try again.",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  return { handleLogout };
};

export default useLogout;
