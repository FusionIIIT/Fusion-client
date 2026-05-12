/**
 * OverstayDetectionTable
 * BR-VH-018: Overstay Detection Component
 * 
 * Features:
 * - Real-time overstay detection based on checkout time
 * - Automatic alert generation when checkout time exceeded
 * - Critical overstay highlighting (>1 day)
 * - Role-based access (VhIncharge/VhCaretaker only)
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Group,
  Badge,
  Box,
  ActionIcon,
  Tooltip,
  TextInput,
  Alert,
  LoadingOverlay,
  Button,
  Text,
  Stack,
  Modal,
  Card,
  Timeline,
  Divider,
} from "@mantine/core";
import { 
  IconSearch, 
  IconRefresh, 
  IconAlertTriangle, 
  IconClock, 
  IconPhone,
  IconUser,
  IconHome,
  IconCalendar,
  IconBell,
  IconExclamationMark
} from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { bookingsAPI } from "../../services/visitorHostelApi";

const URGENCY_COLORS = {
  normal: "blue",
  warning: "orange", 
  critical: "red",
};

function OverstayDetectionTable() {
  const [overstays, setOverstays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOverstay, setSelectedOverstay] = useState(null);
  const [alertResults, setAlertResults] = useState(null);

  const role = useSelector((state) => state.user?.role);
  const isStaff = role === "VhIncharge" || role === "VhCaretaker";

  useEffect(() => {
    if (isStaff) {
      fetchOverstays();
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchOverstays, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isStaff]);

  const fetchOverstays = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsAPI.detectOverstays();
      if (response.success) {
        setOverstays(response.overstays || []);
      } else {
        setError(response.message || "Failed to fetch overstay data");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching overstays");
    } finally {
      setLoading(false);
    }
  };

  const triggerOverstayAlerts = async () => {
    setAlertLoading(true);
    try {
      const response = await bookingsAPI.triggerOverstayAlerts();
      if (response.success) {
        setAlertResults({
          totalOverstays: response.overstay_count,
          alertsSent: response.alerts_sent,
          criticalAlerts: response.critical_alerts,
          message: response.message
        });
        // Refresh data after triggering alerts
        await fetchOverstays();
      } else {
        setError(response.message || "Failed to trigger overstay alerts");
      }
    } catch (err) {
      setError(err.message || "An error occurred while triggering alerts");
    } finally {
      setAlertLoading(false);
    }
  };

  const getUrgencyLevel = (overstay) => {
    if (overstay.overstay_days > 1) return 'critical';
    if (overstay.overstay_days > 0) return 'warning';
    return 'normal';
  };

  const formatOverstayDuration = (overstay) => {
    const days = overstay.overstay_days;
    if (days === 0) {
      return "Today (hours overdue)";
    } else if (days === 1) {
      return "1 day overdue";
    } else {
      return `${days} days overdue`;
    }
  };

  const viewOverstayDetails = (overstay) => {
    setSelectedOverstay(overstay);
    setShowDetailModal(true);
  };

  const filteredOverstays = overstays.filter((overstay) => {
    const query = searchQuery.toLowerCase();
    return (
      overstay.visitors.some(v => v.name.toLowerCase().includes(query)) ||
      overstay.rooms.some(room => room.toLowerCase().includes(query)) ||
      overstay.intender.name.toLowerCase().includes(query) ||
      overstay.booking_id.toString().includes(query)
    );
  });

  if (!isStaff) {
    return (
      <Box p="md">
        <Alert color="orange" icon={<IconExclamationMark size={16} />}>
          Access denied. Only VhIncharge and VhCaretaker can access overstay detection.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Group mb="md" justify="space-between">
        <TextInput
          placeholder="Search by visitor, room, or booking ID..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: "400px" }}
        />
        <Group spacing="xs">
          <ActionIcon onClick={fetchOverstays} loading={loading} variant="default">
            <IconRefresh size={16} />
          </ActionIcon>
          <Button
            leftSection={<IconBell size={16} />}
            onClick={triggerOverstayAlerts}
            loading={alertLoading}
            color="red"
            disabled={filteredOverstays.length === 0}
          >
            Trigger Alerts ({filteredOverstays.length})
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {alertResults && (
        <Alert color="green" mb="md" icon={<IconBell size={16} />}>
          <Text size="sm">
            <strong>Alert Status:</strong> {alertResults.message}<br/>
            <strong>Total Overstays:</strong> {alertResults.totalOverstays} | 
            <strong> Alerts Sent:</strong> {alertResults.alertsSent} | 
            <strong> Critical:</strong> {alertResults.criticalAlerts}
          </Text>
        </Alert>
      )}

      {/* BR-VH-018 Notice */}
      <Alert color="blue" mb="md" icon={<IconAlertTriangle size={16} />}>
        <Text size="sm">
          <strong>BR-VH-018:</strong> Overstay alerts are generated when checkout time is exceeded. 
          Default checkout time is 11:00 AM unless specified otherwise.
        </Text>
      </Alert>

      <Box style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} />
        
        {filteredOverstays.length === 0 ? (
          <Alert color="blue">
            {loading ? "Checking for overstays..." : "No overstays detected"}
          </Alert>
        ) : (
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Visitors</th>
                <th>Rooms</th>
                <th>Expected Checkout</th>
                <th>Overstay Duration</th>
                <th>Urgency</th>
                <th>Intender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOverstays.map((overstay) => {
                const urgency = getUrgencyLevel(overstay);
                return (
                  <tr key={overstay.booking_id}>
                    <td>
                      <Text fw={500}>#{overstay.booking_id}</Text>
                    </td>
                    <td>
                      <Stack spacing={2}>
                        {overstay.visitors.map((visitor, idx) => (
                          <Text key={idx} size="sm">
                            {visitor.name}
                          </Text>
                        ))}
                      </Stack>
                    </td>
                    <td>
                      <Badge color="blue" size="sm">
                        {overstay.rooms.join(", ")}
                      </Badge>
                    </td>
                    <td>
                      <Group spacing={4}>
                        <IconCalendar size={14} />
                        <Text size="sm">
                          {overstay.booking_to} at {overstay.departure_time}
                        </Text>
                      </Group>
                    </td>
                    <td>
                      <Group spacing={4}>
                        <IconClock size={14} />
                        <Text size="sm" color={urgency === 'critical' ? 'red' : urgency === 'warning' ? 'orange' : 'blue'}>
                          {formatOverstayDuration(overstay)}
                        </Text>
                      </Group>
                    </td>
                    <td>
                      <Badge 
                        color={URGENCY_COLORS[urgency]} 
                        size="sm"
                        variant={urgency === 'critical' ? 'filled' : 'light'}
                      >
                        {urgency.toUpperCase()}
                        {urgency === 'critical' && ' ⚠️'}
                      </Badge>
                    </td>
                    <td>
                      <Text size="sm">{overstay.intender.name}</Text>
                    </td>
                    <td>
                      <Tooltip label="View Details">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="blue"
                          onClick={() => viewOverstayDetails(overstay)}
                        >
                          <IconUser size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Box>

      {/* Overstay Detail Modal */}
      <Modal
        opened={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Overstay Details - Booking #${selectedOverstay?.booking_id}`}
        size="lg"
      >
        {selectedOverstay && (
          <Stack spacing="md">
            {/* Critical Warning */}
            {selectedOverstay.is_critical && (
              <Alert color="red" icon={<IconAlertTriangle size={16} />}>
                <Text fw={500}>CRITICAL OVERSTAY</Text>
                <Text size="sm">This booking has exceeded checkout time by more than 1 day.</Text>
              </Alert>
            )}

            <Card withBorder padding="md">
              <Text fw={500} mb="md">Booking Information</Text>
              <Timeline active={2} bulletSize={24} lineWidth={2}>
                <Timeline.Item bullet={<IconCalendar size={12} />} title="Checkout Date">
                  <Text size="sm">{selectedOverstay.booking_to}</Text>
                </Timeline.Item>
                <Timeline.Item bullet={<IconClock size={12} />} title="Departure Time">
                  <Text size="sm">{selectedOverstay.departure_time}</Text>
                </Timeline.Item>
                <Timeline.Item bullet={<IconAlertTriangle size={12} />} title="Overstay Duration" color="red">
                  <Text size="sm" color="red">{formatOverstayDuration(selectedOverstay)}</Text>
                </Timeline.Item>
              </Timeline>
            </Card>

            <Card withBorder padding="md">
              <Text fw={500} mb="md">Visitor Information</Text>
              {selectedOverstay.visitors.map((visitor, idx) => (
                <Group key={idx} mb="xs">
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" fw={500}>{visitor.name}</Text>
                    <Text size="xs" color="dimmed">{visitor.phone}</Text>
                  </div>
                </Group>
              ))}
            </Card>

            <Card withBorder padding="md">
              <Text fw={500} mb="md">Room & Contact Information</Text>
              <Group mb="xs">
                <IconHome size={16} />
                <Text size="sm">Rooms: {selectedOverstay.rooms.join(", ")}</Text>
              </Group>
              <Group mb="xs">
                <IconUser size={16} />
                <Text size="sm">Intender: {selectedOverstay.intender.name}</Text>
              </Group>
              {selectedOverstay.intender.email && (
                <Group>
                  <IconPhone size={16} />
                  <Text size="sm">Email: {selectedOverstay.intender.email}</Text>
                </Group>
              )}
            </Card>

            <Divider />

            <Group justify="right">
              <Button variant="default" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button 
                color="red" 
                leftIcon={<IconBell size={16} />}
                onClick={() => {
                  triggerOverstayAlerts();
                  setShowDetailModal(false);
                }}
              >
                Send Alert for This Overstay
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}

export default OverstayDetectionTable;