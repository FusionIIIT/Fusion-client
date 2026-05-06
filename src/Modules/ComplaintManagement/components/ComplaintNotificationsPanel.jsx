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
            <Group gap="xs" mb={4}>
              <Text fw={600} size="lg">
                Notifications
              </Text>
              <Badge variant="light" color="blue" size="sm">
                {roleFeedLabel}
              </Badge>
            </Group>
            <Text size="sm" className={classes.subtitle}>
              Stay on top of complaint updates, status changes, and alerts.
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="default"
              size="sm"
              leftSection={<ArrowClockwise size={14} />}
              loading={loading}
              onClick={loadNotifications}
            >
              Refresh
            </Button>
            <Button
              size="sm"
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
                padding="sm"
                className={
                  item.unread
                    ? `${classes.notificationCardUnread} ${classes.moduleCard}`
                    : `${classes.notificationCardRead} ${classes.moduleCard}`
                }
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Group gap={6} mb={4}>
                      <Badge
                        color={item.unread ? "blue" : "gray"}
                        variant="light"
                        size="xs"
                      >
                        {item.unread ? "Unread" : "Read"}
                      </Badge>
                      <Badge
                        variant="light"
                        size="xs"
                        color={category === "Announcement" ? "orange" : "teal"}
                      >
                        {category}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {formatNotificationTimestamp(item.timestamp)}
                      </Text>
                    </Group>
                    <Text fw={600} size="sm">
                      {item.verb || "Notification"}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {item.description || "No description available."}
                    </Text>
                  </div>
                  <Group gap={6} wrap="nowrap">
                    {route && (
                      <Button
                        variant="light"
                        color="blue"
                        size="xs"
                        leftSection={<ArrowSquareOut size={12} />}
                        onClick={() => handleOpen(item)}
                      >
                        Open
                      </Button>
                    )}
                    <Button
                      variant="light"
                      color={item.unread ? "blue" : "gray"}
                      size="xs"
                      onClick={() => handleToggleRead(item)}
                    >
                      {item.unread ? "Read" : "Unread"}
                    </Button>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </Group>
                </Group>
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
