import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Flex, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { AppShellLayout } from "../ui/layout/AppShellLayout";
import { buildNavGroups } from "../ui/nav/navigation";
import { buildBottomNav } from "../ui/nav/bottomNav";
import { findActiveLink, findActiveModuleLabel } from "../ui/nav/match";
import { pageTitle } from "../lib/pageTitle";
import {
  setRole,
  setCurrentAccessibleModules,
  setProgrammeType,
} from "../redux/userslice";
import { setCurrentModule } from "../redux/moduleslice";
import { setUnreadCount } from "../redux/notificationSlice";
import {
  getProfileDataRoute,
  updateRoleRoute,
  unreadNotificationCountRoute,
} from "../routes/dashboardRoutes";
import useLogout from "../helper/useLogout";

export function Layout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { handleLogout } = useLogout();

  const username = useSelector((state) => state.user.username);
  const role = useSelector((state) => state.user.role);
  const roles = useSelector((state) => state.user.roles);
  const programmeType = useSelector((state) => state.user.programmeType);
  const accessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules,
  );
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios
      .get(unreadNotificationCountRoute, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(({ data }) => dispatch(setUnreadCount(data.count)))
      .catch(() => {});
  }, [dispatch, role]);

  useEffect(() => {
    if (role !== "student" || programmeType) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios
      .get(getProfileDataRoute, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(({ data }) => {
        const profile = Array.isArray(data) ? data[0] : data;
        dispatch(setProgrammeType(profile?.programme_type || "UG"));
      })
      .catch(() => dispatch(setProgrammeType("UG")));
  }, [dispatch, role, programmeType]);

  const navGroups = useMemo(
    () => buildNavGroups({ role, accessibleModules, programmeType }),
    [role, accessibleModules, programmeType],
  );

  const bottomNavItems = useMemo(
    () => buildBottomNav({ role, navGroups }),
    [role, navGroups],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const activeLabel = findActiveLink(navGroups, pathname)?.label;
  useEffect(() => {
    document.title = pageTitle(activeLabel);
  }, [activeLabel]);

  const moduleLabel = findActiveModuleLabel(navGroups, pathname);
  useEffect(() => {
    if (moduleLabel) dispatch(setCurrentModule(moduleLabel));
  }, [dispatch, moduleLabel]);

  const handleRoleChange = async (newRole) => {
    if (!newRole || newRole === role) return;
    const token = localStorage.getItem("authToken");
    try {
      await axios.patch(
        updateRoleRoute,
        { last_selected_role: newRole },
        { headers: { Authorization: `Token ${token}` } },
      );
      notifications.show({
        title: "Role Updated",
        message: (
          <Flex gap="4px">
            <Text fz="sm">Your role has been changed to </Text>
            <Text fz="sm" fw="500" c="dark">
              {newRole}
            </Text>
          </Flex>
        ),
        color: "green",
      });
      dispatch(setRole(newRole));
      dispatch(setCurrentAccessibleModules());
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Error updating last selected role:",
        error?.response?.data,
      );
    }
  };

  return (
    <AppShellLayout
      navGroups={navGroups}
      activePath={pathname}
      onNavigate={navigate}
      brandSubtitle="FUSION · ERP PORTAL"
      user={{ name: username, roleLabel: role }}
      onLogout={() => handleLogout()}
      roles={roles ?? []}
      role={role}
      onRoleChange={handleRoleChange}
      unreadCount={unreadCount}
      onBellClick={() => navigate("/notifications")}
      bottomNavItems={bottomNavItems}
    >
      {children}
    </AppShellLayout>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
