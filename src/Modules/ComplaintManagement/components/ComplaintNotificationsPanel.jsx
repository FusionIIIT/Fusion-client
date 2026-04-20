import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  ArrowClockwise,
  ArrowSquareOut,
  Bell,
  BellSlash,
  CheckCircle,
  MagnifyingGlass,
  Trash,
} from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import {
  deleteNotification,
  fetchNotifications,
  markNotificationRead,
  markNotificationUnread,
  markVisibleNotificationsRead,
} from "../../NotificationCenter/services";
import {
  formatNotificationTimestamp,
  getNotificationCategory,
  getRoleFeedLabel,
  resolveNotificationRoute,
} from "../../NotificationCenter/utils";
import classes from "../ComplaintManagement.module.css";

const VIEW_FILTERS = [
  { value: "complaints", label: "Complaint Alerts" },
  { value: "unread", label: "Unread" },
  { value: "role", label: "Role Feed" },
  { value: "all", label: "All" },
  { value: "announcements", label: "Announcements" },
];

const getMessage = (error, fallback) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data) {
    return JSON.stringify(error.response.data);
  }
  return error?.message || fallback;
};

export default function ComplaintNotificationsPanel({ role }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("complaints");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);

  const roleFeedLabel = getRoleFeedLabel(role);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const list = await fetchNotifications();
      setItems(list.filter((item) => !item.deleted));
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed to load notifications",
        message: getMessage(error, "Could not fetch notifications."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const pollId = setInterval(() => {
      loadNotifications();
    }, 45000);
    return () => clearInterval(pollId);
  }, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      unread: items.filter((item) => item.unread).length,
      complaints: items.filter(
        (item) => getNotificationCategory(item, role) === "complaints",
      ).length,
      role: items.filter(
        (item) => getNotificationCategory(item, role) === "role",
      ).length,
      announcements: items.filter(
        (item) => getNotificationCategory(item, role) === "announcements",
      ).length,
    }),
    [items, role],
  );

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items
      .filter((item) => {
        const category = getNotificationCategory(item, role);
        const moduleName = String(item?.data?.module || "").toLowerCase();
        const verb = String(item?.verb || "").toLowerCase();
        const description = String(item?.description || "").toLowerCase();
        const matchSearch =
          !q ||
          moduleName.includes(q) ||
          verb.includes(q) ||
          description.includes(q);
        if (!matchSearch) {
          return false;
        }

        if (selectedFilter === "unread") {
          return item.unread;
        }
        if (selectedFilter === "all") {
          return true;
        }
        return category === selectedFilter;
      })
      .sort((a, b) => {
        if (a.unread !== b.unread) {
          return a.unread ? -1 : 1;
        }
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      });
  }, [items, role, search, selectedFilter]);

  const handleToggleRead = async (item) => {
    try {
      if (item.unread) {
        await markNotificationRead(item.id);
      } else {
        await markNotificationUnread(item.id);
      }

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, unread: !entry.unread } : entry,
        ),
      );
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Update failed",
        message: getMessage(error, "Could not update notification status."),
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Delete failed",
        message: getMessage(error, "Could not delete notification."),
      });
    }
  };

  const handleOpen = async (item) => {
    try {
      const route = resolveNotificationRoute(item);
      if (item.unread) {
        await markNotificationRead(item.id);
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id ? { ...entry, unread: false } : entry,
          ),
        );
      }
      if (route) {
        navigate(route);
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Open failed",
        message: getMessage(error, "Could not open notification route."),
      });
    }
  };

  const handleMarkVisibleRead = async () => {
    const targets = displayed.filter((item) => item.unread);
    if (targets.length === 0) {
      return;
    }

    try {
      await markVisibleNotificationsRead(targets);
      const targetIds = new Set(targets.map((item) => item.id));
      setItems((prev) =>
        prev.map((entry) =>
          targetIds.has(entry.id) ? { ...entry, unread: false } : entry,
        ),
      );
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Bulk action failed",
        message: getMessage(
          error,
          "Could not mark visible notifications as read.",
        ),
      });
    }
  };

  return (
    <Stack gap="md">
      <Paper className={classes.notificationPanel} withBorder>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Group gap="xs" mb="xs">
              <Bell size={18} color="#2e5faa" />
              <Text fw={700} className={classes.title}>
                Complaint Notifications
              </Text>
              <Badge variant="light" color="blue">
                {roleFeedLabel}
              </Badge>
            </Group>
            <Text className={classes.subtitle}>
              Notifications are now managed inside Complaint Management so they
              stay in the same Fusion workflow.
            </Text>
            <Text className={classes.statusNote}>
              Prioritize unread alerts and open routes directly from this queue.
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="default"
              leftSection={<ArrowClockwise size={14} />}
              loading={loading}
              onClick={loadNotifications}
            >
              Refresh
            </Button>
            <Button
              leftSection={<CheckCircle size={14} />}
              onClick={handleMarkVisibleRead}
              disabled={displayed.every((item) => !item.unread)}
            >
              Mark visible read
            </Button>
          </Group>
        </Group>
      </Paper>

      <Paper className={classes.notificationToolbar} withBorder>
        <Group justify="space-between" align="center" wrap="wrap">
          <TextInput
            leftSection={<MagnifyingGlass size={14} />}
            placeholder="Search notifications"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            w={{ base: "100%", sm: 320 }}
          />
          <Select
            data={VIEW_FILTERS.map((entry) => ({
              value: entry.value,
              label:
                entry.value === "role"
                  ? roleFeedLabel
                  : `${entry.label} (${counts[entry.value] || 0})`,
            }))}
            value={selectedFilter}
            onChange={(value) => setSelectedFilter(value || "all")}
            w={{ base: "100%", sm: 280 }}
          />
        </Group>
      </Paper>

      {displayed.length === 0 ? (
        <Paper
          className={`${classes.notificationEmpty} ${classes.moduleCard}`}
          withBorder
        >
          <Stack align="center" py="xl" gap="xs">
            <BellSlash size={28} color="#7f8ea5" />
            <Text fw={700}>No notifications in this view</Text>
            <Text size="sm" c="dimmed">
              Try changing the filter or clearing search.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="sm">
          {displayed.map((item) => {
            const route = resolveNotificationRoute(item);
            const category =
              String(item?.data?.flag).toLowerCase() === "announcement"
                ? "Announcement"
                : item?.data?.module || "General";

            return (
              <Card
                key={item.id}
                withBorder
                className={
                  item.unread
                    ? `${classes.notificationCardUnread} ${classes.moduleCard}`
                    : `${classes.notificationCardRead} ${classes.moduleCard}`
                }
              >
                <Stack gap="sm">
                  <Group
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <div>
                      <Group gap="xs" mb={4}>
                        <Badge
                          color={item.unread ? "blue" : "gray"}
                          variant="light"
                        >
                          {item.unread ? "Unread" : "Read"}
                        </Badge>
                        <Badge
                          variant="light"
                          color={
                            category === "Announcement" ? "orange" : "teal"
                          }
                        >
                          {category}
                        </Badge>
                      </Group>
                      <Text fw={700}>{item.verb || "Notification"}</Text>
                      <Text size="sm" c="dimmed">
                        {item.description || "No description available."}
                      </Text>
                    </div>
                    <Button
                      variant="subtle"
                      color="gray"
                      leftSection={<Trash size={14} />}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </Group>

                  <Group justify="space-between" align="center" wrap="wrap">
                    <Text size="xs" c="dimmed">
                      {formatNotificationTimestamp(item.timestamp)}
                    </Text>
                    <Group gap="xs">
                      {route && (
                        <Button
                          variant="light"
                          color="blue"
                          leftSection={<ArrowSquareOut size={14} />}
                          onClick={() => handleOpen(item)}
                        >
                          Open
                        </Button>
                      )}
                      <Button
                        variant="light"
                        color={item.unread ? "blue" : "gray"}
                        leftSection={
                          item.unread ? (
                            <CheckCircle size={14} />
                          ) : (
                            <BellSlash size={14} />
                          )
                        }
                        onClick={() => handleToggleRead(item)}
                      >
                        {item.unread ? "Mark as read" : "Mark unread"}
                      </Button>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

ComplaintNotificationsPanel.propTypes = {
  role: PropTypes.string,
};

ComplaintNotificationsPanel.defaultProps = {
  role: "",
};
