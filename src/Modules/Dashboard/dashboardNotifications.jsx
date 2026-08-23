import axios from "axios";
import PropTypes from "prop-types";
import {
  CaretDown,
  CaretUp,
  SortAscending,
  Trash,
  Funnel,
} from "@phosphor-icons/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Container,
  Loader,
  Badge,
  Button,
  Divider,
  Flex,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  CloseButton,
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import classes from "./dashboardNotifications.module.css";
import { Empty } from "../../components/empty";
import { ModulePage } from "../../ui/components/ModulePage";
import { PageTabs } from "../../ui/components/PageTabs";
import {
  notificationReadRoute,
  notificationDeleteRoute,
  notificationClearRoute,
  notificationUnreadRoute,
  getNotificationsRoute,
  updateRoleRoute,
} from "../../routes/dashboardRoutes";
import { setRole, setCurrentAccessibleModules } from "../../redux/userslice";
import CreateAnnouncementForm from "./CreateAnnouncementForm.jsx";
import {
  incrementUnreadCount,
  decrementUnreadCount,
  setUnreadCount,
} from "../../redux/notificationSlice";

const categories = ["Most Recent", "Tags", "Title"];

const statusFilters = ["All", "Unread", "Read"];

const URL_PATTERN = /(https?:\/\/[^\s]+)/;

function linkifyText(text) {
  if (!text) return text;
  return text.split(URL_PATTERN).map((segment, index) => {
    if (!URL_PATTERN.test(segment)) return segment;
    const trailingPunctuation = segment.match(/[).,!?;:'"]+$/)?.[0] ?? "";
    const url = trailingPunctuation
      ? segment.slice(0, -trailingPunctuation.length)
      : segment;
    return (
      <Fragment key={index}>
        <Anchor href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </Anchor>
        {trailingPunctuation}
      </Fragment>
    );
  });
}

// Modules whose notifications originate in the Academic module; clicking such
// a notification deep-links to that module's tab. An explicit data.url (set by
// newer notify.send calls) always wins over this fallback.
const ACADEMIC_MODULES = ["Academic Calendar", "PhD Course Registration"];

// The role that actually owns a module's admin action. A user with several
// roles sees the same notification under all of them, but clicking should land
// them in the role that can act on it. First match the viewer actually holds
// wins. Modules absent here (e.g. Academic Calendar, which everyone gets) need
// no role switch and open in the current role.
const MODULE_TARGET_ROLES = {
  "PhD Course Registration": ["acadadmin", "studentacadadmin"],
};

function resolveNotificationPath(notification) {
  const url = notification?.data?.url;
  if (typeof url === "string" && url.trim()) return url;
  const moduleName = notification?.data?.module;
  if (moduleName && ACADEMIC_MODULES.includes(moduleName)) {
    return `/academics?tab=${encodeURIComponent(moduleName)}`;
  }
  return null;
}

function resolveNotificationRoles(notification) {
  const tagged = notification?.data?.role;
  if (typeof tagged === "string" && tagged.trim()) return [tagged];
  const moduleName = notification?.data?.module;
  return MODULE_TARGET_ROLES[moduleName] || [];
}

function NotificationItem({
  notification,
  markAsRead,
  deleteNotification,
  markAsUnread,
  onOpen,
  loading,
}) {
  const [expanded, setExpanded] = useState(false);
  const { module, flag } = notification.data;
  const isAnnouncement = flag === "announcement";
  const targetPath = resolveNotificationPath(notification);

  return (
    <Paper
      radius="md"
      p="md"
      withBorder
      style={{
        borderLeft: `0.4rem solid ${notification.unread ? "#15ABFF" : "#E0E0E0"}`,
        cursor: "pointer",
      }}
      onClick={() => {
        if (targetPath) onOpen(notification, targetPath);
        else setExpanded((prev) => !prev);
      }}
    >
      <Flex justify="space-between" align="center" gap="sm" wrap="nowrap">
        <Flex align="center" gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <Text
            fw={notification.unread ? 700 : 500}
            truncate="end"
            style={{ flexShrink: 0, maxWidth: "45%" }}
          >
            {notification.verb}
          </Text>
          {!isAnnouncement && (
            <Badge color="#15ABFF" size="sm" style={{ flexShrink: 0 }}>
              {module || "N/A"}
            </Badge>
          )}
          {!expanded && (
            <Text
              c="#6B6B6B"
              size="sm"
              truncate="end"
              style={{ flex: 1, minWidth: 0 }}
            >
              {notification.description}
            </Text>
          )}
        </Flex>
        <Flex align="center" gap="xs" style={{ flexShrink: 0 }}>
          <Text c="#6B6B6B" size="0.7rem">
            {new Date(notification.timestamp).toLocaleDateString()}
          </Text>
          <CloseButton
            variant="transparent"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
          />
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
          >
            {expanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
          </ActionIcon>
        </Flex>
      </Flex>

      {expanded && (
        <>
          <Divider my="sm" />
          <Flex justify="space-between" align="flex-start" gap="md" wrap="wrap">
            <Text style={{ flex: 1 }}>
              {notification.description
                ? linkifyText(notification.description)
                : "No description available."}
            </Text>
            <Button
              variant="filled"
              color={notification.unread ? "blue" : "gray"}
              onClick={(e) => {
                e.stopPropagation();
                if (notification.unread) markAsRead(notification.id);
                else markAsUnread(notification.id);
              }}
              loaderProps={{ type: "dots" }}
              loading={loading === notification.id}
              miw="120px"
            >
              {notification.unread ? "Mark as read" : "Unread"}
            </Button>
          </Flex>
        </>
      )}
    </Paper>
  );
}

function Dashboard() {
  const [notificationsList, setNotificationsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [activeTab, setActiveTab] = useState("0");
  const [sortedBy, setSortedBy] = useState("Most Recent");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [read_Loading, setRead_Loading] = useState(-1);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.user.role);
  const roles = useSelector((state) => state.user.roles);
  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const canCreateAnnouncement = role === "acadadmin";
  // const tabsListRef = useRef(null);
  const tabItems = [
    { title: "Notifications" },
    { title: "Announcements" },
    ...(canCreateAnnouncement ? [{ title: "Create Announcement" }] : []),
  ];

  useEffect(() => {
    if (Number(activeTab) >= tabItems.length) {
      setActiveTab("0");
    }
  }, [tabItems.length, activeTab]);

  const notificationBadgeCount = notificationsList.filter(
    (n) => !n.deleted && n.unread,
  ).length;
  const announcementBadgeCount = announcementsList.filter(
    (n) => !n.deleted && n.unread,
  ).length;
  const badges = [notificationBadgeCount, announcementBadgeCount];

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return console.error("No authentication token found!");

      try {
        setLoading(true);
        const { data } = await axios.get(getNotificationsRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        const { notifications } = data;
        const parseNotificationData = (raw) => {
          if (raw && typeof raw === "object") return raw;
          try {
            return JSON.parse(raw);
          } catch {
            return {};
          }
        };
        const notificationsData = notifications.map((item) => ({
          ...item,
          data: parseNotificationData(item.data),
        }));

        setNotificationsList(
          notificationsData.filter(
            (item) => item.data?.flag !== "announcement",
          ),
        );
        setAnnouncementsList(
          notificationsData.filter(
            (item) => item.data?.flag === "announcement",
          ),
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch, role]);

  // const handleTabChange = (direction) => {
  //   const newIndex =
  //     direction === "next"
  //       ? Math.min(+activeTab + 1, tabItems.length - 1)
  //       : Math.max(+activeTab - 1, 0);
  //   setActiveTab(String(newIndex));
  //   tabsListRef.current.scrollBy({
  //     left: direction === "next" ? 50 : -50,
  //     behavior: "smooth",
  //   });
  // };

  const notificationsToDisplay =
    activeTab === "1" ? announcementsList : notificationsList;

  // const notification_for_badge_count =
  //   activeTab === "0" ? announcementsList : notificationsList;

  // const notification_count = notification_for_badge_count.filter(
  //   (n) => !n.deleted && n.unread,
  // ).length;

  // sortMap is an object that maps sorting categories to sorting functions.
  const sortedNotifications = useMemo(() => {
    const sortMap = {
      "Most Recent": (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      Tags: (a, b) => a.data.module.localeCompare(b.data.module),
      Title: (a, b) => a.verb.localeCompare(b.verb),
    };
    return [...notificationsToDisplay].sort(sortMap[sortedBy]);
  }, [sortedBy, notificationsToDisplay]);

  const displayedNotifications = useMemo(
    () =>
      sortedNotifications.filter((n) => {
        if (n.deleted) return false;
        if (statusFilter === "Unread") return n.unread;
        if (statusFilter === "Read") return !n.unread;
        return true;
      }),
    [sortedNotifications, statusFilter],
  );

  const markAsRead = async (notifId) => {
    const token = localStorage.getItem("authToken");
    try {
      setRead_Loading(notifId);
      const response = await axios.post(
        notificationReadRoute,
        { id: notifId },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: false } : notif,
          ),
        );
        setAnnouncementsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: false } : notif,
          ),
        );
        dispatch(decrementUnreadCount());
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    } finally {
      setRead_Loading(-1);
    }
  };

  const markAsUnread = async (notifId) => {
    const token = localStorage.getItem("authToken");
    try {
      setRead_Loading(notifId);
      const response = await axios.post(
        notificationUnreadRoute,
        { id: notifId },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: true } : notif,
          ),
        );
        setAnnouncementsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: true } : notif,
          ),
        );
        dispatch(incrementUnreadCount());
      }
    } catch (err) {
      console.error("Error marking notification as unread:", err);
    } finally {
      setRead_Loading(-1);
    }
  };

  const deleteNotification = async (notifId) => {
    const token = localStorage.getItem("authToken");
    const wasUnread = [...notificationsList, ...announcementsList].some(
      (notif) => notif.id === notifId && notif.unread && !notif.deleted,
    );

    try {
      const response = await axios.post(
        notificationDeleteRoute,
        { id: notifId },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.filter((notif) => notif.id !== notifId),
        );
        setAnnouncementsList((prev) =>
          prev.filter((notif) => notif.id !== notifId),
        );
        if (wasUnread) dispatch(decrementUnreadCount());
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    const token = localStorage.getItem("authToken");
    const scope = activeTab === "1" ? "announcement" : "notification";
    try {
      setClearing(true);
      const response = await axios.post(
        notificationClearRoute,
        { scope },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (response.status === 200) {
        if (scope === "announcement") {
          setAnnouncementsList([]);
        } else {
          setNotificationsList([]);
        }
        const unreadCleared = response.data?.unread_cleared ?? 0;
        if (unreadCleared > 0) {
          dispatch(setUnreadCount(Math.max(0, unreadCount - unreadCleared)));
        }
      }
    } catch (err) {
      console.error("Error clearing notifications:", err);
    } finally {
      setClearing(false);
      setClearModalOpen(false);
    }
  };

  const openNotification = async (notification, path) => {
    if (notification.unread) markAsRead(notification.id);
    // If the notification belongs to a role the viewer holds but isn't
    // currently in, switch to that role before navigating so the target page
    // renders under the right role (its tabs/permissions differ per role).
    const targetRole = resolveNotificationRoles(notification).find((r) =>
      roles?.includes(r),
    );
    if (targetRole && targetRole !== role) {
      const token = localStorage.getItem("authToken");
      try {
        await axios.patch(
          updateRoleRoute,
          { last_selected_role: targetRole },
          { headers: { Authorization: `Token ${token}` } },
        );
        dispatch(setRole(targetRole));
        dispatch(setCurrentAccessibleModules());
        showNotification({
          title: "Role switched",
          message: `Switched to ${targetRole} to open this notification.`,
          color: "blue",
        });
      } catch (err) {
        console.error("Failed to switch role for notification:", err);
      }
    }
    navigate(path);
  };

  const visibleCount = notificationsToDisplay.filter((n) => !n.deleted).length;
  const tabLabel = activeTab === "1" ? "announcements" : "notifications";

  return (
    <ModulePage title="Notifications">
      <Flex
        justify="space-between"
        align="flex-start"
        gap="sm"
        direction={{ base: "column", sm: "row" }}
      >
        <PageTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={tabItems.map((item, index) => ({
            value: String(index),
            label: item.title,
            badge: badges[index],
          }))}
          mb={0}
        />

        {activeTab !== "2" && visibleCount > 0 && (
          <Flex
            w={{ base: "100%", sm: "auto" }}
            align="center"
            justify={{ base: "flex-start", sm: "flex-end" }}
            mt={{ base: "sm", sm: 0 }}
            gap="xs"
            wrap="nowrap"
          >
            <Button
              visibleFrom="xs"
              variant="light"
              color="red"
              size="sm"
              radius="md"
              leftSection={<Trash size={16} />}
              onClick={() => setClearModalOpen(true)}
              disabled={visibleCount === 0}
            >
              Clear All
            </Button>
            <ActionIcon
              hiddenFrom="xs"
              variant="light"
              color="red"
              size={36}
              radius="md"
              aria-label="Clear all"
              onClick={() => setClearModalOpen(true)}
              disabled={visibleCount === 0}
            >
              <Trash size={16} />
            </ActionIcon>
            <Select
              classNames={{
                option: classes.selectoptions,
                input: classes.selectinputs,
              }}
              variant="filled"
              size="sm"
              radius="md"
              style={{ flex: "1 1 0", minWidth: 0, maxWidth: 150 }}
              allowDeselect={false}
              leftSection={<Funnel size={16} />}
              data={statusFilters}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || "All")}
              placeholder="Status"
            />
            <Select
              classNames={{
                option: classes.selectoptions,
                input: classes.selectinputs,
              }}
              variant="filled"
              size="sm"
              radius="md"
              style={{ flex: "1 1 0", minWidth: 0, maxWidth: 170 }}
              allowDeselect={false}
              leftSection={<SortAscending size={16} />}
              data={categories}
              value={sortedBy}
              onChange={(value) => setSortedBy(value || "Most Recent")}
              placeholder="Sort By"
            />
          </Flex>
        )}
      </Flex>
      {activeTab === "2" ? (
        <Container fluid pt="xs" pb="xl" px={0}>
          <CreateAnnouncementForm />
        </Container>
      ) : (
        <Stack mt="xl" gap="sm">
          {loading ? (
            <Container py="xl">
              <Loader size="lg" />
            </Container>
          ) : displayedNotifications.length === 0 ? (
            <Empty />
          ) : (
            displayedNotifications.map((notification) => (
              <NotificationItem
                notification={notification}
                key={notification.id}
                markAsRead={markAsRead}
                markAsUnread={markAsUnread}
                deleteNotification={deleteNotification}
                onOpen={openNotification}
                loading={read_Loading}
              />
            ))
          )}
        </Stack>
      )}

      <Modal
        opened={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title={`Clear all ${tabLabel}?`}
        centered
      >
        <Text size="sm" mb="lg">
          This will remove all {visibleCount} {tabLabel} from your list. This
          action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => setClearModalOpen(false)}
            disabled={clearing}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={clearAllNotifications}
            loading={clearing}
          >
            Clear All
          </Button>
        </Group>
      </Modal>
    </ModulePage>
  );
}

export default Dashboard;

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number.isRequired,
    verb: PropTypes.string.isRequired,
    description: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
    data: PropTypes.shape({
      module: PropTypes.string,
      flag: PropTypes.string,
      url: PropTypes.string,
    }),
    unread: PropTypes.bool.isRequired,
  }).isRequired,
  markAsRead: PropTypes.func.isRequired,
  markAsUnread: PropTypes.func.isRequired,
  deleteNotification: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  loading: PropTypes.number.isRequired,
};
