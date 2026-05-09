import PropTypes from "prop-types";
import { Container, Loader, Grid } from "@mantine/core";
import { Empty } from "../../../components/empty";
import NotificationItem from "./NotificationItem";

function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  loading,
  loadingId,
}) {
  if (loading) {
    return (
      <Container py="xl">
        <Loader size="lg" />
      </Container>
    );
  }

  const activeNotifications = notifications.filter((n) => !n.deleted);

  if (activeNotifications.length === 0) {
    return <Empty />;
  }

  return (
    <Grid mt="xl">
      {activeNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onMarkAsUnread={onMarkAsUnread}
          onDelete={onDelete}
          loadingId={loadingId}
        />
      ))}
    </Grid>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      verb: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      deleted: PropTypes.bool,
    }),
  ).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onMarkAsUnread: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  loadingId: PropTypes.number.isRequired,
};

export default NotificationList;
