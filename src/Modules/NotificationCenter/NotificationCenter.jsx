import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  Bell,
  BellSlash,
  ArrowClockwise,
  MagnifyingGlass,
  ArrowSquareOut,
  CheckCircle,
  Trash,
} from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import classes from "./notificationCenter.module.css";
import {
  deleteNotification,
  fetchNotifications,
  markNotificationRead,
  markNotificationUnread,
  markVisibleNotificationsRead,
} from "./services";
import {
  formatNotificationTimestamp,
  getNotificationCategory,
  getRoleFeedLabel,
  resolveNotificationRoute,
} from "./utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "complaints", label: "Complaints" },
  { value: "role", label: "Role Feed" },
  { value: "announcements", label: "Announcements" },
];

const getRoleSummary = (role = "") => {
  const normalizedRole = String(role).toLowerCase();
  if (normalizedRole.includes("caretaker"))
    return "Operations and complaint progress notifications";
  if (
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("convener") ||
    normalizedRole.includes("admin")
  ) {
    return "Escalations, verification decisions, and workflow updates";
  }
  if (normalizedRole.includes("faculty"))
    return "Academic, complaint, and review updates";
  if (normalizedRole.includes("staff"))
    return "Administrative and complaint updates";
  if (normalizedRole.includes("student"))
    return "Your personal, academic, and complaint alerts";
  return "All notifications available to your selected role";
};

const getCategoryCounts = (items, role) => {
  const counts = {
    all: items.length,
    unread: items.filter((item) => item.unread && !item.deleted).length,
    complaints: items.filter(
      (item) => getNotificationCategory(item, role) === "complaints",
    ).length,
    role: items.filter((item) => getNotificationCategory(item, role) === "role")
      .length,
    announcements: items.filter(
      (item) => getNotificationCategory(item, role) === "announcements",
    ).length,
  };

  return counts;
};

const getSummaryStats = (items) => ({
  total: items.length,
  unread: items.filter((item) => item.unread && !item.deleted).length,
  read: items.filter((item) => !item.unread && !item.deleted).length,
  complaints: items.filter((item) => item.data?.module === "Complaint System")
    .length,
});

function NotificationCard({ notification, onOpen, onToggleRead, onDelete }) {
  const route = resolveNotificationRoute(notification);
  const isUnread = Boolean(notification.unread);
  const category =
    String(notification.data?.flag).toLowerCase() === "announcement"
      ? "Announcement"
      : notification.data?.module || "System";

  return (
    <Card
      withBorder
      shadow="sm"
      p="lg"
      className={`${classes.notificationCard} ${isUnread ? classes.unreadCard : classes.readCard}`}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap="xs" wrap="wrap">
              <Badge color={isUnread ? "blue" : "gray"} variant="light">
                {isUnread ? "Unread" : "Read"}
              </Badge>
              <Badge
                color={category === "Announcement" ? "orange" : "teal"}
                variant="light"
              >
                {category}
              </Badge>
            </Group>
            <Text fw={700} size="lg" c="dark">
              {notification.verb || notification.description || "Notification"}
            </Text>
            <Text size="sm" c="dimmed">
              {notification.description ||
                "No additional details were provided for this notification."}
            </Text>
          </Stack>

          <Button
            variant="subtle"
            color="gray"
            leftSection={<Trash size={16} />}
            onClick={() => onDelete(notification.id)}
          >
            Delete
          </Button>
        </Group>

        <Divider />

        <Flex justify="space-between" align="center" wrap="wrap" gap="sm">
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Source module
            </Text>
            <Text size="sm" fw={600}>
              {notification.data?.module || "General"}
            </Text>
          </Stack>
          <Stack gap={2} align="flex-end">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Received
            </Text>
            <Text size="sm" fw={600}>
              {formatNotificationTimestamp(notification.timestamp)}
            </Text>
          </Stack>
        </Flex>

        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="xs" wrap="wrap">
            {notification.data?.url && (
              <Badge variant="outline" color="blue">
                Route: {notification.data.url}
              </Badge>
            )}
            {notification.data?.flag === "announcement" && (
              <Badge variant="outline" color="orange">
                Announcement
              </Badge>
            )}
          </Group>

          <Group gap="xs" wrap="wrap">
            {route && (
              <Button
                variant="light"
                color="blue"
                leftSection={<ArrowSquareOut size={16} />}
                onClick={() => onOpen(notification, route)}
              >
                Open
              </Button>
            )}
            <Button
              variant="light"
              color={isUnread ? "blue" : "gray"}
              leftSection={
                isUnread ? <CheckCircle size={16} /> : <BellSlash size={16} />
              }
              onClick={() => onToggleRead(notification)}
            >
              {isUnread ? "Mark as read" : "Mark unread"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

NotificationCard.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    unread: PropTypes.bool,
    deleted: PropTypes.bool,
    verb: PropTypes.string,
    description: PropTypes.string,
    timestamp: PropTypes.string,
    data: PropTypes.shape({
      module: PropTypes.string,
      flag: PropTypes.string,
      url: PropTypes.string,
    }),
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
  onToggleRead: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function NotificationCenter() {
  const role = useSelector((state) => state.user.role || "");
  const navigate = useNavigate();
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const roleFeedLabel = getRoleFeedLabel(role);
  const roleSummary = getRoleSummary(role);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const items = await fetchNotifications();
      setNotificationsList(items.filter((item) => !item.deleted));
    } catch (error) {
      notifications.show({
        title: "Failed to load notifications",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch notifications.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const intervalId = setInterval(() => {
      loadNotifications();
    }, 45000);

    return () => clearInterval(intervalId);
  }, []);

  const summary = useMemo(
    () => getSummaryStats(notificationsList),
    [notificationsList],
  );
  const categoryCounts = useMemo(
    () => getCategoryCounts(notificationsList, role),
    [notificationsList, role],
  );

  const filters = useMemo(
    () =>
      FILTERS.map((filter) => ({
        ...filter,
        label: filter.value === "role" ? roleFeedLabel : filter.label,
      })),
    [roleFeedLabel],
  );

  const visibleNotifications = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const filtered = notificationsList.filter((notification) => {
      const category = getNotificationCategory(notification, role);
      const moduleName = String(notification.data?.module || "").toLowerCase();
      const verb = String(notification.verb || "").toLowerCase();
      const description = String(notification.description || "").toLowerCase();

      const matchesSearch =
        !searchTerm ||
        verb.includes(searchTerm) ||
        description.includes(searchTerm) ||
        moduleName.includes(searchTerm);

      if (!matchesSearch) {
        return false;
      }

      switch (activeFilter) {
        case "unread":
          return notification.unread;
        case "complaints":
          return category === "complaints";
        case "role":
          return category === "role";
        case "announcements":
          return category === "announcements";
        default:
          return true;
      }
    });

    return [...filtered].sort((a, b) => {
      if (a.unread !== b.unread) {
        return a.unread ? -1 : 1;
      }

      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });
  }, [activeFilter, notificationsList, role, search]);

  const handleToggleRead = async (notification) => {
    try {
      if (notification.unread) {
        await markNotificationRead(notification.id);
      } else {
        await markNotificationUnread(notification.id);
      }

      setNotificationsList((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, unread: !item.unread }
            : item,
        ),
      );
    } catch (error) {
      notifications.show({
        title: "Notification update failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Could not update the notification.",
        color: "red",
      });
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotificationsList((prev) =>
        prev.filter((item) => item.id !== notificationId),
      );
    } catch (error) {
      notifications.show({
        title: "Delete failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Could not delete the notification.",
        color: "red",
      });
    }
  };

  const handleOpen = async (notification, route) => {
    try {
      if (notification.unread) {
        await markNotificationRead(notification.id);
        setNotificationsList((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, unread: false } : item,
          ),
        );
      }

      navigate(route);
    } catch (error) {
      notifications.show({
        title: "Could not open notification",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to navigate to the related page.",
        color: "red",
      });
    }
  };

  const handleMarkAllVisible = async () => {
    const targetNotifications = visibleNotifications.filter(
      (item) => item.unread,
    );
    if (targetNotifications.length === 0) {
      return;
    }

    try {
      await markVisibleNotificationsRead(targetNotifications);
      const unreadIds = new Set(targetNotifications.map((item) => item.id));
      setNotificationsList((prev) =>
        prev.map((item) =>
          unreadIds.has(item.id) ? { ...item, unread: false } : item,
        ),
      );
    } catch (error) {
      notifications.show({
        title: "Bulk read failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Could not mark notifications as read.",
        color: "red",
      });
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <Container fluid px="lg" py="md" className={classes.page}>
        <Paper p="xl" className={classes.hero} mb="lg" withBorder={false}>
          <Stack gap="lg" className={classes.heroContent}>
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <div>
                <Group gap="sm" mb="xs">
                  <Bell size={24} weight="fill" />
                  <Badge color="cyan" variant="filled">
                    Notification Centre
                  </Badge>
                </Group>
                <Title order={1} className={classes.heroTitle}>
                  Your notification stream, organized by role.
                </Title>
                <Text size="lg" className={classes.heroSubtext} mt="sm">
                  {roleSummary}
                </Text>
              </div>

              <Stack gap="xs" align="flex-end">
                <Badge color="blue" variant="light" size="lg">
                  {String(role || "unknown role").toUpperCase()}
                </Badge>
                <Text size="sm" c="gray.2">
                  Auto-refreshes every 45 seconds
                </Text>
              </Stack>
            </Group>

            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
              <Card className={classes.summaryCard} withBorder>
                <Stack gap={6}>
                  <Text size="sm" c="dimmed" fw={700} tt="uppercase">
                    Total
                  </Text>
                  <Text size="2rem" fw={800}>
                    {summary.total}
                  </Text>
                </Stack>
              </Card>
              <Card className={classes.summaryCard} withBorder>
                <Stack gap={6}>
                  <Text size="sm" c="dimmed" fw={700} tt="uppercase">
                    Unread
                  </Text>
                  <Text size="2rem" fw={800} c="blue">
                    {summary.unread}
                  </Text>
                </Stack>
              </Card>
              <Card className={classes.summaryCard} withBorder>
                <Stack gap={6}>
                  <Text size="sm" c="dimmed" fw={700} tt="uppercase">
                    Complaint alerts
                  </Text>
                  <Text size="2rem" fw={800} c="teal">
                    {summary.complaints}
                  </Text>
                </Stack>
              </Card>
              <Card className={classes.summaryCard} withBorder>
                <Stack gap={6}>
                  <Text size="sm" c="dimmed" fw={700} tt="uppercase">
                    Read
                  </Text>
                  <Text size="2rem" fw={800} c="gray">
                    {summary.read}
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        </Paper>

        <Paper p="md" className={classes.toolbar} withBorder mb="lg">
          <Stack gap="md">
            <Group justify="space-between" align="flex-end" wrap="wrap">
              <TextInput
                leftSection={<MagnifyingGlass size={16} />}
                placeholder="Search by title, module, or description"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                w={{ base: "100%", sm: 420 }}
              />

              <Group gap="sm" wrap="wrap">
                <Button
                  variant="default"
                  leftSection={<ArrowClockwise size={16} />}
                  onClick={loadNotifications}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button
                  leftSection={<CheckCircle size={16} />}
                  onClick={handleMarkAllVisible}
                  disabled={visibleNotifications.every((item) => !item.unread)}
                >
                  Mark visible read
                </Button>
              </Group>
            </Group>

            <Tabs value={activeFilter} onChange={setActiveFilter}>
              <Tabs.List className={classes.filterTabList}>
                {filters.map((filter) => {
                  const count = categoryCounts[filter.value] || 0;
                  return (
                    <Tabs.Tab
                      key={filter.value}
                      value={filter.value}
                      className={`${classes.filterTab} ${activeFilter === filter.value ? classes.filterTabActive : ""}`}
                    >
                      <Group gap="xs">
                        <Text fw={600}>{filter.label}</Text>
                        <Badge size="sm" variant="light">
                          {count}
                        </Badge>
                      </Group>
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>
            </Tabs>
          </Stack>
        </Paper>

        {loading && notificationsList.length === 0 ? (
          <Paper p="xl" className={classes.emptyShell} withBorder>
            <Stack align="center" py="xl" gap="md">
              <Loader size="lg" />
              <Text fw={700} size="lg">
                Loading notifications
              </Text>
            </Stack>
          </Paper>
        ) : visibleNotifications.length === 0 ? (
          <Paper p="xl" className={classes.emptyShell} withBorder>
            <Stack align="center" py="xl" gap="md">
              <BellSlash size={42} color="#64748b" />
              <Text fw={700} size="lg">
                No notifications match this view
              </Text>
              <Text c="dimmed" ta="center" maw={520}>
                Try a different filter, clear the search box, or refresh the
                inbox.
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="md">
            <Alert color="blue" variant="light" radius="lg">
              <Group justify="space-between" wrap="wrap">
                <Text fw={600}>
                  {roleFeedLabel} highlights notifications most relevant to your
                  current role.
                </Text>
                <Text size="sm" c="dimmed">
                  Use Open to jump to supported modules or mark items read
                  directly here.
                </Text>
              </Group>
            </Alert>

            {visibleNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onOpen={handleOpen}
                onToggleRead={handleToggleRead}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        )}
      </Container>
    </>
  );
}
