import axios from "axios";
import PropTypes from "prop-types";
import { CaretDown, CaretUp, SortAscending } from "@phosphor-icons/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Container,
  Loader,
  Badge,
  Button,
  Divider,
  Flex,
  Paper,
  Select,
  Stack,
  Text,
  CloseButton,
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import classes from "./Dashboard.module.css";
import { Empty } from "../../components/empty";
import CustomBreadcrumbs from "../../components/Breadcrumbs.jsx";
import {
  notificationReadRoute,
  notificationDeleteRoute,
  notificationUnreadRoute,
  getNotificationsRoute,
} from "../../routes/dashboardRoutes";
import ModuleTabs from "../../components/moduleTabs.jsx";
import CreateAnnouncementForm from "./CreateAnnouncementForm.jsx";
import {
  incrementUnreadCount,
  decrementUnreadCount,
} from "../../redux/notificationSlice";

const categories = ["Most Recent", "Tags", "Title"];

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

function NotificationItem({
  notification,
  markAsRead,
  deleteNotification,
  markAsUnread,
  loading,
}) {
  const [expanded, setExpanded] = useState(false);
  const { module, flag } = notification.data;
  const isAnnouncement = flag === "announcement";

  return (
    <Paper
      radius="md"
      p="md"
      withBorder
      style={{
        borderLeft: `0.4rem solid ${notification.unread ? "#15ABFF" : "#E0E0E0"}`,
        cursor: "pointer",
      }}
      onClick={() => setExpanded((prev) => !prev)}
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
          {expanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
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
  const [loading, setLoading] = useState(false);
  const [read_Loading, setRead_Loading] = useState(-1);
  const dispatch = useDispatch();
  const role = useSelector((state) => state.user.role);
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
        const notificationsData = notifications.map((item) => ({
          ...item,
          data: JSON.parse(item.data.replace(/'/g, '"')),
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

        {activeTab !== "2" && (
          <Flex
            w={{ base: "40%", sm: "auto" }}
            align="center"
            mt="md"
            rowGap="1rem"
            columnGap="4rem"
            wrap="wrap"
          >
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
          ) : sortedNotifications.filter(
              (notification) => !notification.deleted,
            ).length === 0 ? (
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
                  loading={read_Loading}
                />
              ))
          )}
        </Stack>
      )}
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
  loading: PropTypes.number.isRequired,
};
