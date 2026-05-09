import axios from "axios";
import PropTypes from "prop-types";
import {
  SortAscending,
  Megaphone,
  CalendarBlank,
  Star,
  EnvelopeOpen,
  Envelope,
  Trash,
  CheckCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Container,
  Loader,
  Badge,
  Button,
  Flex,
  Grid,
  Group,
  Modal,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { notifications as toast } from "@mantine/notifications";
import { useDispatch, useSelector } from "react-redux";
import classes from "./Dashboard.module.css";
import { Empty } from "../../components/empty";
import CustomBreadcrumbs from "../../components/Breadcrumbs.jsx";
import {
  notificationReadRoute,
  notificationDeleteRoute,
  notificationUnreadRoute,
  notificationStarRoute,
  getNotificationsRoute,
  markAllReadRoute,
  markAllUnreadRoute,
} from "../../routes/dashboardRoutes";
import { broadcastRoute } from "../../routes/notificationRoutes";
import ModuleTabs from "../../components/moduleTabs.jsx";

const AUDIENCE_OPTIONS = [
  { value: "all",           label: "All Users" },
  { value: "students",      label: "All Students" },
  { value: "faculty",       label: "All Faculty" },
  { value: "staff",         label: "All Staff" },
  { value: "department",    label: "By Department" },
  { value: "batch",         label: "By Batch" },
  { value: "group",         label: "Specific Designation" },
  { value: "specific_user", label: "Specific Users" },
];

// Backend endpoints powering the dependent dropdowns
const HOST = "";
const AUDIENCE_DEPARTMENTS_URL  = `${HOST}/api/notifications/audience/departments/`;
const AUDIENCE_DESIGNATIONS_URL = `${HOST}/api/notifications/audience/designations/`;
const AUDIENCE_BATCHES_URL      = `${HOST}/api/notifications/audience/batches/`;
const AUDIENCE_USERS_URL        = `${HOST}/api/notifications/audience/users/`;

const categories = ["Most Recent", "Tags", "Title"];

// Defensive parse for older rows that may still hold a Python-repr string
const safeParse = (s) => {
  try {
    return JSON.parse(String(s).replace(/'/g, '"'));
  } catch {
    return {};
  }
};

// Pretty timestamp like "5m ago", "2h ago", "yesterday", "Apr 26"
function timeAgo(ts) {
  const d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)       return "just now";
  if (diff < 3600)     return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)    return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800)   return "yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function NotificationItem({
  notification,
  markAsRead,
  deleteNotification,
  markAsUnread,
  toggleStar,
  loading,
}) {
  const { module, flag } = notification.data || {};
  const isAnnouncement = flag === "announcement";
  const starred = !!notification.data?.starred;
  const accent  = isAnnouncement ? "#FA8C16" : "#15ABFF";

  const [expanded, setExpanded] = useState(false);

  return (
    <Grid.Col span={{ base: 12, md: 6 }} key={notification.id}>
      <Paper
        radius="md"
        p="md"
        withBorder
        shadow={notification.unread ? "xs" : "none"}
        style={{
          borderLeft: `4px solid ${accent}`,
          background: notification.unread ? "var(--mantine-color-blue-0)" : "white",
          transition: "background 120ms ease",
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" wrap="wrap" mb={2}>
              {isAnnouncement && (
                <Badge color="orange" variant="light" size="sm" radius="sm">
                  Announcement
                </Badge>
              )}
              {module && (
                <Badge color="gray" variant="default" size="sm" radius="sm">
                  {module}
                </Badge>
              )}
            </Group>
            <Text
              fw={notification.unread ? 700 : 500}
              size="sm"
              lineClamp={expanded ? undefined : 2}
              style={{ wordBreak: "break-word" }}
              onClick={() => setExpanded((v) => !v)}
            >
              {notification.verb || "Notification"}
            </Text>
            {notification.description &&
              notification.description !== notification.verb && (
              <Text
                size="sm"
                c="dimmed"
                lineClamp={expanded ? undefined : 3}
                style={{ wordBreak: "break-word" }}
              >
                {notification.description}
              </Text>
            )}
            {((notification.verb || "").length > 80 ||
              (notification.description || "").length > 100) && (
              <Text
                size="xs"
                c="blue"
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Show more"}
              </Text>
            )}
            <Group gap="xs" mt={2}>
              <Text size="xs" c="dimmed">
                {timeAgo(notification.timestamp)}
              </Text>
              {isAnnouncement && notification.data?.expiry_date && (
                <Badge
                  size="xs"
                  variant="light"
                  color="orange"
                  leftSection={<CalendarBlank size={11} weight="duotone" />}
                  radius="sm"
                >
                  Expires {new Date(notification.data.expiry_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </Badge>
              )}
            </Group>
          </Stack>

          <Group gap={4} wrap="nowrap">
            <Tooltip label={starred ? "Unstar" : "Star"} withArrow>
              <ActionIcon
                variant="subtle"
                color={starred ? "yellow" : "gray"}
                size="lg"
                onClick={() => toggleStar(notification.id)}
                aria-label="Star"
              >
                <Star size={18} weight={starred ? "fill" : "regular"} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={notification.unread ? "Mark as read" : "Mark as unread"} withArrow>
              <ActionIcon
                variant="subtle"
                color={notification.unread ? "blue" : "gray"}
                size="lg"
                loading={loading === notification.id}
                onClick={() =>
                  notification.unread
                    ? markAsRead(notification.id)
                    : markAsUnread(notification.id)
                }
                aria-label="Toggle read"
              >
                {notification.unread
                  ? <Envelope size={18} />
                  : <EnvelopeOpen size={18} />}
              </ActionIcon>
            </Tooltip>
            {!isAnnouncement && (
              <Tooltip label="Archive (180-day retention)" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="lg"
                  onClick={() => deleteNotification(notification.id)}
                  aria-label="Delete"
                >
                  <Trash size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Paper>
    </Grid.Col>
  );
}

function Dashboard() {
  const [notificationsList, setNotificationsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [activeTab, setActiveTab] = useState("0");
  const [sortedBy, setSortedBy] = useState("Most Recent");

  // UC-NT-03: Broadcast announcement (staff only) — inline modal
  const isStaff = useSelector((s) => s.user.isStaff);
  const [broadcastOpen,  setBroadcastOpen]  = useState(false);
  const [bTitle,         setBTitle]         = useState("");
  const [bMessage,       setBMessage]       = useState("");
  const [bAudience,      setBAudience]      = useState("all");
  const [bAudienceValue, setBAudienceValue] = useState("");   // single string (department/batch/group)
  const [bUsers,         setBUsers]         = useState([]);   // array (specific_user multi)
  const [bExpiry,        setBExpiry]        = useState(null);
  const [bSending,       setBSending]       = useState(false);

  // Audience option lists (fetched once when modal first opens)
  const [departments,    setDepartments]    = useState([]);
  const [designations,   setDesignations]   = useState([]);
  const [batches,        setBatches]        = useState([]);
  const [usersList,      setUsersList]      = useState([]);
  const [audienceLoaded, setAudienceLoaded] = useState(false);

  useEffect(() => {
    if (!broadcastOpen || audienceLoaded) return;
    const token = localStorage.getItem("authToken");
    const headers = { Authorization: `Token ${token}` };
    Promise.all([
      axios.get(AUDIENCE_DEPARTMENTS_URL,  { headers }),
      axios.get(AUDIENCE_DESIGNATIONS_URL, { headers }),
      axios.get(AUDIENCE_BATCHES_URL,      { headers }),
      axios.get(AUDIENCE_USERS_URL,        { headers }),
    ])
      .then(([d, g, b, u]) => {
        setDepartments(d.data.departments || []);
        setDesignations(g.data.designations || []);
        setBatches(b.data.batches || []);
        setUsersList(u.data.users || []);
        setAudienceLoaded(true);
      })
      .catch(() =>
        toast.show({ color: "red", message: "Failed to load audience options." }),
      );
  }, [broadcastOpen, audienceLoaded]);

  // Reset the secondary value whenever the audience type changes
  useEffect(() => { setBAudienceValue(""); setBUsers([]); }, [bAudience]);

  const audienceNeedsSingle = ["department", "batch", "group"].includes(bAudience);
  const audienceNeedsUsers  = bAudience === "specific_user";

  const submitBroadcast = async () => {
    if (!bTitle.trim() || !bMessage.trim() || !bExpiry) {
      toast.show({ color: "orange", message: "Please fill all required fields." });
      return;
    }
    if (audienceNeedsSingle && !bAudienceValue.trim()) {
      toast.show({ color: "orange", message: "Please pick the audience value." });
      return;
    }
    if (audienceNeedsUsers && bUsers.length === 0) {
      toast.show({ color: "orange", message: "Please pick at least one user." });
      return;
    }

    let audienceValue = "";
    if (audienceNeedsSingle) audienceValue = bAudienceValue.trim();
    if (audienceNeedsUsers)  audienceValue = bUsers.join(",");

    setBSending(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        broadcastRoute,
        {
          title:          bTitle.trim(),
          message:        bMessage.trim(),
          audience_type:  bAudience,
          audience_value: audienceValue,
          expiry_date:    (bExpiry instanceof Date ? bExpiry : new Date(bExpiry))
                            .toISOString()
                            .split("T")[0],
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      toast.show({
        color: "green",
        message:
          audienceNeedsUsers && bUsers.length > 1
            ? `Announcement broadcasted to ${bUsers.length} users.`
            : "Announcement broadcasted.",
      });
      setBroadcastOpen(false);
      setBTitle(""); setBMessage("");
      setBAudience("all"); setBAudienceValue(""); setBUsers([]);
      setBExpiry(null);
    } catch (err) {
      const detail = err?.response?.data?.error || "Failed to broadcast.";
      toast.show({ color: "red", message: typeof detail === "string" ? detail : "Failed to broadcast." });
    } finally {
      setBSending(false);
    }
  };
  const [loading, setLoading] = useState(false);
  const [read_Loading, setRead_Loading] = useState(-1);
  const dispatch = useDispatch();
  // const tabsListRef = useRef(null);
  const tabItems = [{ title: "Notifications" }, { title: "Announcements" }];

  const notificationBadgeCount = notificationsList.filter(
    (n) => !n.deleted && n.unread,
  ).length;
  const announcementBadgeCount = announcementsList.filter(
    (n) => !n.deleted && n.unread,
  ).length;
  const badges = [notificationBadgeCount, announcementBadgeCount];

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async ({ silent = false } = {}) => {
      const token = localStorage.getItem("authToken");
      if (!token) return console.error("No authentication token found!");

      try {
        if (!silent) setLoading(true);
        const { data } = await axios.get(getNotificationsRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        if (cancelled) return;
        const { notifications } = data;
        const notificationsData = notifications.map((item) => ({
          ...item,
          data: typeof item.data === "string" ? safeParse(item.data) : (item.data || {}),
        }));

        setNotificationsList(
          notificationsData.filter((item) => item.flag !== "announcement"),
        );
        setAnnouncementsList(
          notificationsData.filter((item) => item.flag === "announcement"),
        );
      } catch (error) {
        if (!cancelled) console.error("Error fetching dashboard data:", error);
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    };

    // Initial load — show the loader
    fetchDashboardData();

    // Poll every 5s in the background — keeps the list in sync with the bell.
    const interval = setInterval(() => fetchDashboardData({ silent: true }), 5000);

    // Refetch whenever the tab regains focus — covers long sleeps where polling paused.
    const onFocus = () => fetchDashboardData({ silent: true });
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [dispatch]);

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

  const markAsRead = async (notifId) => {
    const token = localStorage.getItem("authToken");
    try {
      setRead_Loading(notifId);
      const response = await axios.patch(
        notificationReadRoute(notifId),
        {},
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
      const response = await axios.patch(
        notificationUnreadRoute(notifId),
        {},
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
      }
    } catch (err) {
      console.error("Error marking notification as unread:", err);
    } finally {
      setRead_Loading(-1);
    }
  };

  const deleteNotification = async (notifId) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.delete(notificationDeleteRoute(notifId), {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.filter((notif) => notif.id !== notifId),
        );
        setAnnouncementsList((prev) =>
          prev.filter((notif) => notif.id !== notifId),
        );
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Star toggle (server-side flip of data.starred)
  const toggleStar = async (notifId) => {
    const token = localStorage.getItem("authToken");
    try {
      const { data } = await axios.patch(
        notificationStarRoute(notifId),
        {},
        { headers: { Authorization: `Token ${token}` } },
      );
      const apply = (list) =>
        list.map((n) =>
          n.id === notifId
            ? { ...n, data: { ...(n.data || {}), starred: data.starred } }
            : n,
        );
      setNotificationsList(apply);
      setAnnouncementsList(apply);
    } catch (err) {
      console.error("Error toggling star:", err);
    }
  };

  // Bulk actions — Mark all read / Mark all unread / Delete all (BR-NT-09 archive)
  const markAllRead = async () => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.patch(markAllReadRoute, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      const apply = (list) => list.map((n) => ({ ...n, unread: false }));
      setNotificationsList(apply);
      setAnnouncementsList(apply);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const markAllUnread = async () => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.patch(markAllUnreadRoute, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      const apply = (list) => list.map((n) => ({ ...n, unread: true }));
      setNotificationsList(apply);
      setAnnouncementsList(apply);
    } catch (err) {
      console.error("Error marking all as unread:", err);
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <Flex
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mt="lg"
        direction={{ base: "column", sm: "row" }}
      >
        {/* <Flex
          justify="flex-start"
          align="center"
          gap={{ base: "0.5rem", md: "1rem" }}
          mt={{ base: "1rem", md: "1.5rem" }}
          ml={{ md: "lg" }}
        >
          <Button
            onClick={() => handleTabChange("prev")}
            variant="default"
            p={0}
            style={{ border: "none" }}
          >
            <CaretCircleLeft
              className={classes.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>

          <div className={classes.fusionTabsContainer} ref={tabsListRef}>
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
                {tabItems.map((item, index) => (
                  <Tabs.Tab
                    value={`${index}`}
                    key={index}
                    className={
                      activeTab === `${index}`
                        ? classes.fusionActiveRecentTab
                        : ""
                    }
                  >
                    <Flex gap="4px">
                      <Text>{item.title}</Text>
                      {activeTab !== index.toString() && (
                        <Badge
                          color={notification_count === 0 ? "grey" : "blue"}
                          size="sm"
                          p={6}
                        >
                          {notification_count}
                        </Badge>
                      )}
                    </Flex>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </div>

          <Button
            onClick={() => handleTabChange("next")}
            variant="default"
            p={0}
            style={{ border: "none" }}
          >
            <CaretCircleRight
              className={classes.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>
        </Flex> */}

        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          badges={badges}
        />

        <Flex
          w={{ base: "40%", sm: "auto" }}
          align="center"
          mt="md"
          rowGap="1rem"
          columnGap="1rem"
          wrap="wrap"
        >
          {isStaff && (
            <Button
              leftSection={<Megaphone size={16} weight="fill" />}
              color="orange"
              onClick={() => setBroadcastOpen(true)}
            >
              Broadcast
            </Button>
          )}
          <Select
            classNames={{
              option: classes.selectoptions,
              input: classes.selectinputs,
            }}
            variant="filled"
            leftSection={<SortAscending />}
            data={categories}
            value={sortedBy}
            onChange={setSortedBy}
            placeholder="Sort By"
          />
        </Flex>
      </Flex>

      {/* UC-NT-03: Broadcast announcement modal — inline, no new page */}
      <Modal
        opened={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        title={<Text fw={700} size="lg">Broadcast Announcement</Text>}
        size="lg"
        radius="md"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="e.g. Campus network maintenance on Friday"
            required
            size="md"
            radius="md"
            value={bTitle}
            onChange={(e) => setBTitle(e.target.value)}
          />
          <Textarea
            label="Message"
            placeholder="Enter the full announcement content…"
            required
            size="md"
            radius="md"
            minRows={3}
            autosize
            value={bMessage}
            onChange={(e) => setBMessage(e.target.value)}
          />
          <Select
            label="Target Audience"
            data={AUDIENCE_OPTIONS}
            value={bAudience}
            onChange={setBAudience}
            size="md"
            radius="md"
          />
          {bAudience === "department" && (
            <Select
              label="Department"
              placeholder="Pick a department"
              searchable
              size="md"
              radius="md"
              data={departments}
              value={bAudienceValue}
              onChange={(v) => setBAudienceValue(v || "")}
            />
          )}
          {bAudience === "group" && (
            <Select
              label="Designation"
              placeholder="Pick a designation"
              searchable
              size="md"
              radius="md"
              data={designations}
              value={bAudienceValue}
              onChange={(v) => setBAudienceValue(v || "")}
            />
          )}
          {bAudience === "batch" && (
            <Select
              label="Batch"
              placeholder="Pick a batch (e.g. 23BCS)"
              searchable
              size="md"
              radius="md"
              data={batches}
              value={bAudienceValue}
              onChange={(v) => setBAudienceValue(v || "")}
            />
          )}
          {bAudience === "specific_user" && (
            <MultiSelect
              label={`Users (${usersList.length} available — type to search)`}
              placeholder={bUsers.length ? "" : "Type a name or username (e.g. skjain, ABHAY, 24BCS)"}
              description="Filters live as you type — search by username, first name, or last name."
              searchable
              clearable
              hidePickedOptions
              size="md"
              radius="md"
              limit={200}
              maxValues={500}
              data={usersList}
              value={bUsers}
              onChange={setBUsers}
              nothingFoundMessage="No matching users"
            />
          )}
          <TextInput
            label="Expiry Date"
            type="date"
            required
            size="md"
            radius="md"
            leftSection={<CalendarBlank size={18} weight="duotone" />}
            leftSectionPointerEvents="none"
            min={new Date().toISOString().split("T")[0]}
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                   .toISOString().split("T")[0]}
            value={bExpiry ? new Date(bExpiry).toISOString().split("T")[0] : ""}
            onChange={(e) => setBExpiry(e.target.value ? new Date(e.target.value) : null)}
          />
          <Flex justify="flex-end" gap="sm" mt="lg">
            <Button
              variant="default"
              size="md"
              radius="md"
              onClick={() => setBroadcastOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="orange"
              size="md"
              radius="md"
              leftSection={<Megaphone size={16} weight="fill" />}
              loading={bSending}
              onClick={submitBroadcast}
            >
              Broadcast
            </Button>
          </Flex>
        </Stack>
      </Modal>
      {/* Toolbar — counter + bulk actions */}
      {!loading && sortedNotifications.length > 0 && (
        <Paper withBorder radius="md" p="sm" mt="md" mb="sm">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="xs">
              <Badge color="blue" variant="filled" size="lg" radius="sm">
                {sortedNotifications.filter((n) => n.unread).length} unread
              </Badge>
              <Text size="sm" c="dimmed">
                of {sortedNotifications.length} {activeTab === "1" ? "announcements" : "notifications"}
              </Text>
            </Group>
            <Group gap="xs">
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={<CheckCircle size={14} weight="fill" />}
                onClick={markAllRead}
              >
                Mark all read
              </Button>
              <Button
                size="xs"
                variant="light"
                color="gray"
                leftSection={<Envelope size={14} />}
                onClick={markAllUnread}
              >
                Mark all unread
              </Button>
            </Group>
          </Group>
        </Paper>
      )}

      <Grid mt="md" gutter="md">
        {loading ? (
          <Container py="xl">
            <Loader size="lg" />
          </Container>
        ) : sortedNotifications.filter((notification) => !notification.deleted)
            .length === 0 ? (
          <Empty />
        ) : (
          sortedNotifications
            .filter((notification) => !notification.deleted)
            .map((notification) => (
              <NotificationItem
                notification={notification}
                key={notification.id}
                markAsRead={markAsRead}
                markAsUnread={markAsUnread}
                deleteNotification={deleteNotification}
                toggleStar={toggleStar}
                loading={read_Loading}
              />
            ))
        )}
      </Grid>
    </>
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
    }),
    unread: PropTypes.bool.isRequired,
  }).isRequired,
  markAsRead: PropTypes.func.isRequired,
  markAsUnread: PropTypes.func.isRequired,
  deleteNotification: PropTypes.func.isRequired,
  toggleStar: PropTypes.func.isRequired,
  loading: PropTypes.number.isRequired,
};