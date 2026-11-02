import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Flex, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { AppShellLayout } from "../ui/layout/AppShellLayout";
import { usePendingCounts } from "../Modules/Dashboard/usePendingCounts";
import { countsByPath } from "../Modules/Dashboard/pendingQueues";
import { buildNavGroups } from "../ui/nav/navigation";
import { buildBottomNav } from "../ui/nav/bottomNav";
import {
  findActiveLink,
  findActiveModuleLabel,
  flattenNavLinks,
} from "../ui/nav/match";
import { pageTitle } from "../lib/pageTitle";
import {
  setRole,
  setCurrentAccessibleModules,
  setProgrammeType,
  setProfilePhoto,
} from "../redux/userslice";
import { setCurrentModule } from "../redux/moduleslice";
import { setUnreadCount } from "../redux/notificationSlice";
import {
  getProfileDataRoute,
  leaveRoleRoute,
  updateRoleRoute,
  unreadNotificationCountRoute,
} from "../routes/dashboardRoutes";
import { host, profileCompletionRoute } from "../routes/globalRoutes";
import useLogout from "../helper/useLogout";

export function Layout({ children = null }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { handleLogout } = useLogout();

  const username = useSelector((state) => state.user.username);
  const role = useSelector((state) => state.user.role);
  const isSystemAdmin = useSelector((state) => state.user.isSystemAdmin);
  const roles = useSelector((state) => state.user.roles);
  const leavableRoles = useSelector((state) => state.user.leavableRoles);
  const programmeType = useSelector((state) => state.user.programmeType);
  const accessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules,
  );
  const pluggedNavigation = useSelector(
    (state) => state.user.currentPluggedNavigation,
  );
  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const profilePhoto = useSelector((state) => state.user.profilePhoto);

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

  useEffect(() => {
    if (role !== "student" || profilePhoto) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios
      .get(profileCompletionRoute, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(({ data }) => {
        if (data?.data?.photo) dispatch(setProfilePhoto(data.data.photo));
      })
      .catch(() => {});
  }, [dispatch, role, profilePhoto]);

  const navGroups = useMemo(() => {
    if (isSystemAdmin) {
      return [
        {
          section: "System administration",
          items: [
            {
              code: "home",
              label: "Role overview",
              icon: "House",
              to: "/dashboard",
            },
          ],
        },
      ];
    }
    return buildNavGroups({
      role,
      accessibleModules,
      programmeType,
      pluggedNavigation,
    });
  }, [
    isSystemAdmin,
    role,
    accessibleModules,
    programmeType,
    pluggedNavigation,
  ]);

  const bottomNavItems = useMemo(
    () => buildBottomNav({ role, navGroups }),
    [role, navGroups],
  );

  const reachablePaths = useMemo(
    () => flattenNavLinks(navGroups).map((link) => link.to),
    [navGroups],
  );
  const { queues, counts } = usePendingCounts(reachablePaths);
  const navCounts = useMemo(
    () => countsByPath(queues, counts),
    [queues, counts],
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
    if (isSystemAdmin) return;
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

  const handleLeaveRole = async (roleToLeave) => {
    const token = localStorage.getItem("authToken");
    try {
      const { data } = await axios.post(
        leaveRoleRoute,
        { role: roleToLeave },
        { headers: { Authorization: `Token ${token}` } },
      );
      notifications.show({
        title: "Role ended",
        message: data.next_role
          ? `${roleToLeave} ended at ${new Date(data.end_time).toLocaleString()}. Switched to ${data.next_role}.`
          : `${roleToLeave} ended at ${new Date(data.end_time).toLocaleString()}. You have no other active role.`,
        color: "blue",
      });
      window.location.assign("/dashboard");
      return true;
    } catch (error) {
      notifications.show({
        title: "Could not leave role",
        message:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          "Please try again.",
        color: "red",
      });
      return false;
    }
  };

  if (isSystemAdmin && pathname !== "/dashboard") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShellLayout
      navGroups={navGroups}
      activePath={pathname}
      onNavigate={navigate}
      brandSubtitle="FUSION · ERP PORTAL"
      user={{
        name: username,
        roleLabel: isSystemAdmin ? "SYSTEM ADMIN" : role,
        photo: profilePhoto ? `${host}${profilePhoto}` : "",
      }}
      onLogout={() => handleLogout()}
      roles={isSystemAdmin ? [] : (roles ?? [])}
      leavableRoles={isSystemAdmin ? [] : (leavableRoles ?? [])}
      role={role}
      onRoleChange={handleRoleChange}
      onLeaveRole={handleLeaveRole}
      unreadCount={unreadCount}
      onBellClick={() => navigate("/notifications")}
      bottomNavItems={bottomNavItems}
      navCounts={navCounts}
    >
      {children ?? <Outlet />}
    </AppShellLayout>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
