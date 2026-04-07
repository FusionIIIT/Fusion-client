import { Flex, Select, Container, Loader, Grid } from "@mantine/core";
import { SortAscending } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import CustomBreadcrumbs from "../../components/Breadcrumbs.jsx";
import ModuleTabs from "../../components/moduleTabs.jsx";
import { NotificationCard } from "../../Modules/Notification/components/NotificationCard";
import {
  getUnreadCount,
  sortNotifications,
  filterActiveNotifications,
} from "../../Modules/Notification/utils/notificationUtils";
import { Empty } from "../../components/empty";
import classes from "../../Modules/Dashboard/Dashboard.module.css";
import NotificationsHook from "../../Modules/Notification/Notifications";
import AnnouncementsHook from "../../Modules/Notification/Announcements";

/**
 * Combined Notifications and Announcements view
 */
function NotificationView() {
  const notificationsData = NotificationsHook();
  const announcementsData = AnnouncementsHook();

  const [activeTab, setActiveTab] = useState("0");
  const [sortedBy, setSortedBy] = useState("Most Recent");

  const tabItems = [{ title: "Notifications" }, { title: "Announcements" }];

  // Get data based on active tab
  const currentList =
    activeTab === "0"
      ? notificationsData.notificationsList
      : announcementsData.announcementsList;
  const currentHandlers =
    activeTab === "0" ? notificationsData : announcementsData;
  const loading =
    activeTab === "0" ? notificationsData.loading : announcementsData.loading;
  const loadingId =
    activeTab === "0"
      ? notificationsData.loadingId
      : announcementsData.loadingId;

  // Calculate badge counts
  const notifCount = getUnreadCount(notificationsData.notificationsList);
  const announceCount = getUnreadCount(announcementsData.announcementsList);
  const badges = [notifCount, announceCount];

  // Sort data
  const sortedNotifications = useMemo(
    () => sortNotifications(currentList, sortedBy),
    [sortedBy, currentList],
  );

  const activeNotifications = filterActiveNotifications(sortedNotifications);

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
            data={["Most Recent", "Tags", "Title"]}
            value={sortedBy}
            onChange={setSortedBy}
            placeholder="Sort By"
          />
        </Flex>
      </Flex>

      {/* Notifications/Announcements Grid */}
      {loading ? (
        <Container py="xl">
          <Loader size="lg" />
        </Container>
      ) : activeNotifications.length === 0 ? (
        <Empty />
      ) : (
        <Grid mt="xl">
          {activeNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onMarkAsRead={currentHandlers.markAsRead}
              onMarkAsUnread={currentHandlers.markAsUnread}
              onDelete={currentHandlers.deleteNotification}
              loadingId={loadingId}
            />
          ))}
        </Grid>
      )}
    </>
  );
}

export default NotificationView;
