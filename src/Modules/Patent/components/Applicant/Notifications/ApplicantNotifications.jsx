import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Button, Text, Box, Grid, Loader, Badge, ActionIcon } from "@mantine/core";
import { Check, Bell, ArrowRight, CheckCircle } from "phosphor-react";
import axios from "axios";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

const API_BASE_URL = `${host}/patentsystem`;

const styles = {
  notificationCard: {
    padding: "1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 5px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    borderLeft: "10px solid #3182ce",
    backgroundColor: "#fff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    marginLeft: "-10px",
  },
  unreadCard: {
    borderLeft: "10px solid #228be6",
    backgroundColor: "#f8faff",
  },
  notificationTitle: {
    fontSize: "22px",
    fontWeight: 500,
    marginBottom: "0",
    color: "#1a1b1e",
  },
  notificationStatus: {
    fontSize: "1rem",
    fontWeight: 500,
    marginBottom: "0.5rem",
  },
  notificationDate: {
    fontSize: "0.875rem",
    color: "#666",
    marginBottom: "1rem",
  },
  notificationDescription: {
    fontSize: "0.875rem",
    color: "#444",
    marginBottom: "0",
    flex: 1,
  },
  markReadButton: {
    width: "100%",
    marginTop: "auto",
    color: "#3182ce",
    fontWeight: 500,
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: 600,
    marginBottom: "10px",
    color: "#1a1b1e",
  },
  container: {
    width: "100%",
    padding: "0 1rem",
    maxWidth: "1800px",
    margin: "0 50px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
};

const getNotificationColor = (type) => {
  switch (type) {
    case "Application Approved":
      return "#38a169";
    case "Application Rejected":
      return "#e53e3e";
    case "Appeal Update":
      return "#805ad5";
    case "Action Required":
      return "#dd6b20";
    case "Deadline Approaching":
      return "#d69e2e";
    case "Deadline Expired":
      return "#c53030";
    case "Status Change":
      return "#3182ce";
    case "Consent Required":
      return "#319795";
    case "Revision Requested":
      return "#ed8936";
    default:
      return "#3182ce";
  }
};

function NotificationCard({
  id,
  title,
  notification_type,
  message,
  created_at,
  is_read,
  action_url,
  onMarkAsRead,
}) {
  const color = getNotificationColor(notification_type);
  const date = new Date(created_at);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();

  return (
    <Card style={{ ...styles.notificationCard, ...(is_read ? {} : styles.unreadCard) }}>
      <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text style={styles.notificationTitle}>{title}</Text>
        {!is_read && <Badge color="blue" size="sm">New</Badge>}
      </Box>
      <Text style={{ ...styles.notificationStatus, color }}>{notification_type}</Text>
      <Text style={styles.notificationDate}>{`${formattedDate} | ${formattedTime}`}</Text>
      <Text style={styles.notificationDescription}>{message}</Text>
      <Box style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
        {!is_read && (
          <Button
            variant="outline"
            leftSection={<Check size={16} />}
            style={styles.markReadButton}
            onClick={() => onMarkAsRead(id)}
          >
            Mark as Read
          </Button>
        )}
        {action_url && (
          <Button
            variant="light"
            rightSection={<ArrowRight size={16} />}
            onClick={() => window.location.href = action_url}
          >
            View
          </Button>
        )}
      </Box>
    </Card>
  );
}

NotificationCard.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  notification_type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  is_read: PropTypes.bool.isRequired,
  action_url: PropTypes.string,
  onMarkAsRead: PropTypes.func.isRequired,
};

NotificationCard.defaultProps = {
  action_url: "",
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notifications/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.post(
        `${API_BASE_URL}/notifications/${id}/read/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.post(
        `${API_BASE_URL}/notifications/read-all/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <Box style={styles.container}>
        <Loader size="lg" />
      </Box>
    );
  }

  return (
    <Box style={styles.container}>
      <Box style={styles.headerRow}>
        <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Bell size={28} weight="fill" color="#3182ce" />
          <Text style={styles.pageTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Badge color="red" size="lg">{unreadCount} unread</Badge>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="light"
            leftSection={<CheckCircle size={16} />}
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {error && (
        <Text color="red" mb="md">{error}</Text>
      )}

      {notifications.length === 0 ? (
        <Card p="xl" withBorder>
          <Text ta="center" c="dimmed">No notifications yet</Text>
        </Card>
      ) : (
        <Box style={{ width: "100%" }}>
          <Grid gutter="xl" align="stretch" style={{ margin: 0 }}>
            {notifications.map((notification) => (
              <Grid.Col
                span={6}
                p="md"
                key={notification.id}
                style={{ minHeight: "100%" }}
              >
                <NotificationCard
                  id={notification.id}
                  title={notification.title}
                  notification_type={notification.notification_type}
                  message={notification.message}
                  created_at={notification.created_at}
                  is_read={notification.is_read}
                  action_url={notification.action_url}
                  onMarkAsRead={handleMarkAsRead}
                />
              </Grid.Col>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default NotificationsPage;
