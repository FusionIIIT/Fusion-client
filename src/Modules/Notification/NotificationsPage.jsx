import { useMemo, useState } from "react";
import { Flex } from "@mantine/core";
import CustomBreadcrumbs from "../../components/Breadcrumbs.jsx";
import ModuleTabs from "../../components/moduleTabs.jsx";
import { useNotifications } from "./hooks/useNotifications";
import { sortNotifications, getUnreadCount } from "./utils/notificationUtils";
import NotificationList from "./components/NotificationList";
import NotificationFilters from "./components/NotificationFilters";

function NotificationsPage() {
  const {
    notificationsList,
    announcementsList,
    loading,
    markAsRead,
    markAsUnread,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("0");
  const [sortedBy, setSortedBy] = useState("Most Recent");
  const [loadingId, setLoadingId] = useState(-1);

  // Tab configuration
  const tabItems = [{ title: "Notifications" }, { title: "Announcements" }];

  // Calculate badge counts
  const notificationBadgeCount = getUnreadCount(notificationsList);
  const announcementBadgeCount = getUnreadCount(announcementsList);
  const badges = [notificationBadgeCount, announcementBadgeCount];

  // Get current tab data
  const notificationsToDisplay =
    activeTab === "1" ? announcementsList : notificationsList;

  // Sort notifications
  const sortedNotifications = useMemo(
    () => sortNotifications(notificationsToDisplay, sortedBy),
    [sortedBy, notificationsToDisplay],
  );

  // Handlers with loading state management
  const handleMarkAsRead = async (notifId) => {
    try {
      setLoadingId(notifId);
      await markAsRead(notifId);
    } finally {
      setLoadingId(-1);
    }
  };

  const handleMarkAsUnread = async (notifId) => {
    try {
      setLoadingId(notifId);
      await markAsUnread(notifId);
    } finally {
      setLoadingId(-1);
    }
  };

  const handleDelete = async (notifId) => {
    try {
      setLoadingId(notifId);
      await deleteNotification(notifId);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setLoadingId(-1);
    }
  };

  return (
    <>
      <CustomBreadcrumbs />

      {/* Header with tabs and filters */}
      <Flex
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mt="lg"
        direction={{ base: "column", sm: "row" }}
      >
        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          badges={badges}
        />

        <NotificationFilters sortedBy={sortedBy} onSortChange={setSortedBy} />
      </Flex>

      {/* Notifications list */}
      <NotificationList
        notifications={sortedNotifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsUnread={handleMarkAsUnread}
        onDelete={handleDelete}
        loading={loading}
        loadingId={loadingId}
      />
    </>
  );
}

export default NotificationsPage;
