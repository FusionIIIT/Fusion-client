import { useEffect, useState } from "react";
import { User, SignOut, Bell, UserSwitch } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  Avatar,
  Burger,
  Flex,
  Indicator,
  Popover,
  Group,
  Stack,
  Text,
  Button,
  Select,
  Box,
} from "@mantine/core";
// import { useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { notifications } from "@mantine/notifications";
import { setRole, setCurrentAccessibleModules } from "../redux/userslice";
import classes from "../Modules/Dashboard/Dashboard.module.css";
import avatarImage from "../assets/avatar.png";
import { setUnreadCount } from "../redux/notificationSlice";

import {
  updateRoleRoute,
  unreadNotificationCountRoute,
} from "../routes/dashboardRoutes";
import useLogout from "../helper/useLogout";

function Header({ opened, toggleSidebar }) {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const username = useSelector((state) => state.user.username);
  const roles = useSelector((state) => state.user.roles);
  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  // const queryclient = useQueryClient();

  const handleRoleChange = async (newRole) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.patch(
        updateRoleRoute,
        {
          last_selected_role: newRole,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
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
      console.log(response.data.message);
      dispatch(setRole(newRole));
      dispatch(setCurrentAccessibleModules());
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating last selected role:", error.response.data);
    }
  };
  const { handleLogout } = useLogout();

  return (
    <Flex
      bg="#F5F7F8"
      justify="space-between"
      align="center"
      pl="sm"
      h="64px" // Height has already been set in layout.jsx but had to set the height here as well for properly aligning the avatar
    >
      <Box>
        <Burger
          opened={opened}
          onClick={toggleSidebar}
          hiddenFrom="sm"
          size="sm"
        />
      </Box>
      <Flex
        justify={{ base: "space-between" }}
        align="center"
        h="100%"
        w="100%"
      >
        <Text fz={{ base: "h2", xs: "h3" }} visibleFrom="sm">
          FUSION - IIITDMJ's ERP Portal
        </Text>
        <Flex
          justify="flex-end"
          align="center"
          gap="2rem"
          px={{ base: "sm", md: "lg" }}
        >
          <Select
            classNames={{
              option: classes.selectoptions,
              input: classes.selectinputs,
            }}
            variant="default"
            rightSection={<UserSwitch size="24px" />}
            data={roles}
            value={role}
            onChange={handleRoleChange}
            placeholder="Role"
          />
          <Indicator
            label={unreadCount > 99 ? "99+" : unreadCount}
            size={16}
            color="red"
            disabled={unreadCount === 0}
          >
            <Bell
              color="orange"
              size="32px"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/dashboard")}
            />
          </Indicator>
          <Popover
            opened={popoverOpened}
            onChange={setPopoverOpened}
            width={{ xxs: "320px", xs: "340px" }}
            position="bottom-end"
            withArrow
            shadow="xl"
          >
            <Popover.Target>
              <Avatar
                size="46px"
                radius="xl"
                src={avatarImage}
                onClick={() => setPopoverOpened((open) => !open)}
                style={{ cursor: "pointer" }}
                mr="12px"
              />
            </Popover.Target>
            <Popover.Dropdown
              style={{
                border: "1px solid #f0f0f0",
              }}
              width={{ xxs: "320px", xs: "340px" }}
            >
              <Group spacing="xs">
                <Avatar size="xl" radius="xl" src={avatarImage} />
                <Stack gap={8}>
                  <Text size="lg" fz={{ xxs: 18, xs: 24 }} fw={700}>
                    {username?.length > 18
                      ? `${username.slice(0, 18)}...`
                      : username}
                  </Text>

                  <Flex gap="xs" direction={{ xxs: "column", xs: "row" }}>
                    <Button
                      rightSection={<User size={16} />}
                      variant="light"
                      color="blue"
                      size="xs"
                      onClick={() =>
                        navigate(
                          role === "student"
                            ? "/profile"
                            : "/facultyprofessionalprofile",
                        )
                      }
                    >
                      Profile
                    </Button>
                    <Button
                      rightSection={<SignOut size={16} />}
                      variant="light"
                      color="pink"
                      size="xs"
                      onClick={() => handleLogout()}
                    >
                      Log out
                    </Button>
                  </Flex>
                </Stack>
              </Group>
            </Popover.Dropdown>
          </Popover>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Header;

Header.propTypes = {
  opened: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};
